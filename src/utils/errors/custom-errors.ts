import { RabbitQueue } from '../types/rabbit';

export class RetryableError extends Error {
  constructor(info: { queue?: RabbitQueue }) {
    super(JSON.stringify({ ...info, retry: true }));
  }
}

export function isRetryableError(err: Error) {
  try {
    if (err instanceof RetryableError) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}
