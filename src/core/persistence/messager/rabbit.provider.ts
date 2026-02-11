import { Injectable, Logger } from '@nestjs/common';
import { type Channel } from 'amqplib';
import amqp from 'amqplib';
import { niceEnv } from 'src/utils/functions/env';
import { RabbitEvent, RabbitQueue } from 'src/utils/types/rabbit';

@Injectable()
export class RabbitProvider {
  channel: Channel;
  logger: Logger;
  async onModuleInit() {
    const conn = await amqp.connect(niceEnv.RABBIT_URL);
    this.channel = await conn.createChannel();
    this.logger = new Logger();
    this.logger.log('RABBIT MQ CONNECTED');
  }

  async publish(queue: RabbitQueue, payload: RabbitEvent) {
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
  }

  async consume(
    queue: RabbitQueue,
    fn: (payload: RabbitEvent) => Promise<void>,
    options?: amqp.Options.Consume,
  ) {
    await this.channel.consume(
      queue,
      async (msg) => {
        const payload = JSON.parse(msg.content.toString()) as RabbitEvent;
        try {
          await fn(payload);
          this.channel.ack(msg);
        } catch (err) {
          this.channel.nack(msg, false, false);
        }
      },
      options,
    );
  }
}
