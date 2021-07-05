type ErrSpec =
  | {
      errType: 'free-form';
      message: string;
    }
  | {
      errType: 'expectedButGot';
      expectedButGot: [Type | string, Type | string];
    }
  | {
      errType: 'expectedArgCount';
      expectedArgCount: [string, number, number];
    }
  | {
      errType: 'expectedUnit';
      expectedUnit: [AST.Unit[] | null, AST.Unit[] | null];
    };

function specToString(spec: ErrSpec) {
  switch (spec.errType) {
    case 'free-form': {
      return spec.message;
    }
    case 'expectedButGot': {
      const [expected, got] = spec.expectedButGot;
      const str = (a: Type | string) =>
        typeof a === 'string' ? a : a.toBasicString();

      return `This operation requires a ${str(expected)} and a ${str(
        got
      )} was entered`;
    }
    case 'expectedUnit': {
      return 'This operation requires matching units';
    }
    case 'expectedArgCount': {
      const [fname, expected, got] = spec.expectedArgCount;

      return `The function ${fname} requires ${expected} parameters and ${got} parameters were entered`;
    }
  }
}

export class InferError {
  // @ts-expect-error might be uninitialized, TODO fix
  spec: ErrSpec;

  constructor(message?: string) {
    if (message) {
      this.spec = { errType: 'free-form', message };
    }
  }

  static expectedButGot(
    expected: Type | string,
    got: Type | string
  ): InferError {
    const error = new InferError();
    error.spec = { errType: 'expectedButGot', expectedButGot: [expected, got] };
    return error;
  }

  static expectedArgCount(
    fname: string,
    expected: number,
    got: number
  ): InferError {
    const error = new InferError();
    error.spec = {
      errType: 'expectedArgCount',
      expectedArgCount: [fname, expected, got],
    };
    return error;
  }

  static expectedUnit(expected: AST.Unit[] | null, got: AST.Unit[] | null) {
    const error = new InferError();
    error.spec = { errType: 'expectedUnit', expectedUnit: [expected, got] };
    return error;
  }

  get message() {
    return specToString(this.spec);
  }
}
