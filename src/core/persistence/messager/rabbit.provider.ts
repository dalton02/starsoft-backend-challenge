import { Injectable, Logger } from '@nestjs/common';
import { type Channel } from 'amqplib';
import amqp from 'amqplib';
import { isRetryableError } from 'src/utils/errors/custom-errors';
import { niceEnv } from 'src/utils/functions/env';
import { wait } from 'src/utils/functions/time';
import {
  RabbitEvent,
  RabbitExchange,
  RabbitExchangeType,
  RabbitQueue,
  RabbitQueueType,
} from 'src/utils/types/rabbit';

@Injectable()
export class RabbitProvider {
  channel: Channel;
  logger: Logger;

  private MAX_RETRYS = 10;

  async onModuleInit() {
    const conn = await amqp.connect(niceEnv.RABBIT_URL);
    this.channel = await conn.createChannel();
    this.logger = new Logger();
    this.logger.log('RABBIT MQ CONNECTED');

    await this.channel.assertExchange(RabbitExchange.DLQ_ERRORS, 'direct', {
      durable: true,
    });

    await this.channel.assertQueue(RabbitQueue.DLQ_ERROR, {
      durable: true,
    });
    await this.channel.bindQueue(
      RabbitQueue.DLQ_ERROR,
      RabbitExchange.DLQ_ERRORS,
      RabbitQueue.DLQ_ERROR,
    );

    await this.channel.consume(RabbitQueue.DLQ_ERROR, async (msg) => {
      console.log('MENSAGEM FALHOU MESMO APOS RETRYS COM BACKOFF EXPONENCIAL');
      this.channel.ack(msg);
    });
  }

  async publish(
    exchange: RabbitExchangeType,
    queue: RabbitQueueType,
    payload: RabbitEvent,
  ) {
    this.channel.publish(exchange, queue, Buffer.from(JSON.stringify(payload)));
  }

  async consume(
    queue: RabbitQueueType,
    fn: (payload: RabbitEvent) => Promise<void>,
    options?: amqp.Options.Consume,
  ) {
    await this.channel.consume(
      queue,
      async (msg) => {
        const payload = JSON.parse(msg.content.toString()) as RabbitEvent;
        const retrys = msg.properties.headers['retry-count'] ?? 0;
        try {
          await fn(payload);
          this.channel.ack(msg);
        } catch (err) {
          if (retrys >= this.MAX_RETRYS) {
            this.channel.publish(
              RabbitExchange.DLQ_ERRORS,
              RabbitQueue.DLQ_ERROR,
              msg.content,
            );
            this.channel.ack(msg);
            return;
          }
          this.channel.publish(
            RabbitExchange.RESERVATION_EVENTS,
            queue,
            msg.content,
            {
              persistent: true,
              headers: {
                'x-delay': Math.pow(2, retrys + 1),
                'retry-count': retrys + 1,
              },
            },
          );

          this.channel.ack(msg);
        }
      },
      options,
    );
  }
}
