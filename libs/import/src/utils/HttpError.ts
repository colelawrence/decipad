export class HttpError extends Error {
  public code = 500;

  constructor(message: string, code: number | string) {
    super(message);
    this.code = Number(code);
  }
  static fromResponse({
    message,
    code,
  }: {
    message: string;
    code: number;
  }): HttpError {
    return new HttpError(message, code);
  }
}
