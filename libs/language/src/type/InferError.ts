import { getDefined } from '../utils';

export class InferError {
  _message?: string;
  expected?: [Type | string, Type | string];
  expectedArgCount?: [string, number, number];
  expectedUnit?: [AST.Unit[] | null, AST.Unit[] | null];

  constructor(message?: string) {
    this._message = message;
  }

  static expectedButGot(
    expected: Type | string,
    got: Type | string
  ): InferError {
    const error = new InferError();
    error.expected = [expected, got];
    return error;
  }

  static badArgCount(fname: string, expected: number, got: number): InferError {
    const error = new InferError();
    error.expectedArgCount = [fname, expected, got];
    return error;
  }

  static badUnits(expected: AST.Unit[] | null, got: AST.Unit[] | null) {
    const error = new InferError();
    error.expectedUnit = [expected, got];
    return error;
  }

  get message() {
    if (this._message != null) {
      return this._message;
    } else if (this.expected != null) {
      const [expected, got] = getDefined(this.expected);
      const str = (a: Type | string) =>
        typeof a === 'string' ? a : a.toBasicString();

      return `This operation requires a ${str(expected)} and a ${str(
        got
      )} was entered`;
    } else if (this.expectedUnit != null) {
      return 'This operation requires matching units';
    } else {
      const [fname, expected, got] = getDefined(this.expectedArgCount);

      return `The function ${fname} requires ${expected} parameters and ${got} parameters were entered`;
    }
  }
}
