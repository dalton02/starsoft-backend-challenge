import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { niceEnv } from 'src/utils/functions/env';
@Injectable()
export class RedisService {
  private readonly redis;
  private readonly logger;
  private globalPrefix: string = '';

  constructor(globalPrefix?: string) {
    this.redis = new Redis(niceEnv.REDIS_URL);
    this.logger = new Logger(RedisService.name);
    this.globalPrefix = globalPrefix ?? '';
  }

  async onModuleInit() {
    this.redis.on('error', (err) => {
      this.logger.error(
        'Redis connection error:',
        err ?? 'Unknown error (possibly connection refused)',
      );
    });
    this.redis.on('connect', () => this.logger.log('Connected to Redis'));
    this.redis.on('ready', () => this.logger.log('Redis client ready'));
    this.redis.on('reconnecting', () =>
      this.logger.warn('Reconnecting to Redis...'),
    );
    this.redis.on('end', () => this.logger.warn('Redis connection closed'));
  }

  generateCache<P>(params: { prefix: string; expiration: number }) {
    const { expiration, prefix } = params;
    return new RedisCache<P>(
      this.redis,
      expiration,
      prefix,
      this.globalPrefix,
      this.logger,
    );
  }
}

class RedisCache<P> {
  redis: Redis;
  expiration: number;
  prefix: string;
  logger: Logger;
  constructor(
    redis: Redis,
    expiration: number,
    prefix: string,
    globalPrefix: string,
    logger: Logger,
  ) {
    this.redis = redis;
    this.expiration = expiration;
    this.prefix = prefix;
    this.logger = logger;

    if (globalPrefix) {
      this.prefix = globalPrefix + '-';
    }
  }

  async set(key: string, value: P): Promise<[string | null, string | null]> {
    try {
      const data = await this.redis.set(
        `${this.prefix}:${key}`,
        JSON.stringify(value),
        'EX',
        this.expiration,
      );

      return [data, null];
    } catch {
      return [null, 'Erro ao salvar entidade em memória'];
    }
  }

  async get(key: string): Promise<P | null> {
    const data = await this.redis.get(`${this.prefix}:${key}`);

    if (!data) return null;

    return JSON.parse(data) as P;
  }

  async getMany(): Promise<P[] | null> {
    const data = await this.redis.keys(`${this.prefix}:*`);

    if (!data) return null;

    const formattedData = await Promise.all(
      data.map(async (item) => this.get(item.split(':')[1])),
    );

    return formattedData;
  }
  async deleteKey(key: string): Promise<[number | null, string | null]> {
    try {
      const result = await this.redis.del(`${this.prefix}:${key}`);

      return [result, null];
    } catch {
      return [
        null,
        'There was in fact a error when trying to deleting this key, please try to contact our team of developers, cause this is a very meaner error that cannot get pass into this project',
      ];
    }
  }
  async deleteMany(subPrefix: string = ''): Promise<[number, string | null]> {
    try {
      const pattern = subPrefix
        ? `${this.prefix}:${subPrefix}*`
        : `${this.prefix}:*`;

      const keys = await this.redis.keys(pattern);

      if (!keys?.length) {
        return [0, null];
      }

      const deletedCount = await this.redis.del(...keys);

      return [deletedCount, null];
    } catch (err) {
      this.logger.error('Erro em deleteMany:', err);
      return [
        0,
        'Erro ao deletar múltiplas chaves. Tente novamente ou contate a equipe.',
      ];
    }
  }
}
