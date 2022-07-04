import { InferError } from '..';

export class RuntimeError extends Error {
  public inferError: InferError | undefined;

  constructor(message: string | InferError) {
    if (typeof message === 'string') {
      super(message);
    } else {
      super('Runtime error');
      this.inferError = message;
    }
  }
}
