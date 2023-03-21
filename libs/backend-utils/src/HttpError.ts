export class HttpError extends Error {
  public code: number;

  constructor(message: string, code: number | string) {
    super(message);
    this.code = Number(code);
  }
  static fromResponse({ message, code }: { message: string; code: number }) {
    return new HttpError(message, code);
  }
}
