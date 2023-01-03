import { Token } from 'moo';

export interface ISyntaxError {
  message: string;
  token?: Token;
  isEmptyExpressionError?: boolean;
  detailMessage?: string;
  source?: string;
  line?: number;
  column?: number;
  posistionedCaret?: string;
  expected?: string[];
}

export class SyntaxError extends Error implements ISyntaxError {
  readonly detailMessage?: string;
  readonly token?: Token;
  readonly source?: string;
  readonly line?: number;
  readonly column?: number;
  readonly posistionedCaret?: string;
  readonly expected?: string[];

  constructor(args: ISyntaxError) {
    super(args.message);
    const {
      detailMessage,
      source,
      line,
      column,
      posistionedCaret,
      expected,
      token,
    } = args;
    this.token = token;
    this.detailMessage = detailMessage;
    this.source = source;
    this.line = line;
    this.column = column;
    this.posistionedCaret = posistionedCaret;
    this.expected = expected;
  }

  static fromNearleySyntaxError(err: ISyntaxError): SyntaxError {
    return new SyntaxError(err);
  }
}
