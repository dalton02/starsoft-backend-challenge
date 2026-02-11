import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { niceEnv } from 'src/utils/functions/env';
@Injectable()
export class RedisService {
  public readonly redis: Redis;
  private readonly logger: Logger;

  constructor() {
    this.redis = new Redis(niceEnv.REDIS_URL, {
      connectTimeout: 5000,
      commandTimeout: 3000,
      maxRetriesPerRequest: 2,
    });

    this.logger = new Logger(RedisService.name);
  }

  generateCache<Content, Keys extends Record<string, string | number>>(
    keyTemplate: string,
    expiration: number,
  ) {
    return new RedisCache<Content, Keys>(
      this.redis,
      expiration,
      keyTemplate,
      this.logger,
    );
  }
}

export class RedisCache<Content, Keys extends Record<string, string | number>> {
  private redis: Redis;
  private expiration: number;
  private keyTemplate: string;
  private prefix: string;
  private logger: Logger;

  constructor(
    redis: Redis,
    expiration: number,
    keyTemplate: string,
    logger: Logger,
  ) {
    this.redis = redis;
    this.expiration = expiration;
    this.keyTemplate = keyTemplate;
    this.logger = logger;
  }

  private buildKey(params: Keys): string {
    const key = this.keyTemplate.replace(
      /\$\{(\w+)\}/g,
      (_, param: keyof Keys & string) => {
        if (!(param in params)) {
          throw new Error(`Missing key param: ${param}`);
        }
        return String(params[param]);
      },
    );

    return `${this.prefix}${key}`;
  }

  async set(
    params: Keys,
    value: Content,
  ): Promise<[string | null, string | null]> {
    try {
      const key = this.buildKey(params);

      const data = await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        this.expiration,
      );

      this.logger.log(
        'Updating redis key: ',
        key,
        'updated to: ',
        JSON.stringify(value),
      );

      return [data, null];
    } catch (err) {
      this.logger.error(err);
      return [null, 'Erro ao salvar entidade em memória'];
    }
  }

  async get(params: Keys): Promise<Content | null> {
    const key = this.buildKey(params);

    const data = await this.redis.get(key);
    if (!data) return null;

    this.logger.log('Getting hot data from redis');
    return JSON.parse(data) as Content;
  }

  async deleteKey(params: Keys): Promise<[number | null, string | null]> {
    try {
      const key = this.buildKey(params);
      const result = await this.redis.del(key);
      return [result, null];
    } catch (err) {
      this.logger.error(err);
      return [null, 'Erro ao deletar chave'];
    }
  }
}
