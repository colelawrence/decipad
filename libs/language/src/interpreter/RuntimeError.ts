import { InferError } from '..';

export class RuntimeError extends Error {
  constructor(message: string | InferError) {
    if (typeof message === 'string') {
      super(message);
    } else {
      super(message.message);
    }
  }
}
