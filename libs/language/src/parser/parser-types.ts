// eslint-disable-next-line no-restricted-imports
import type { AST } from '@decipad/language-types';
import type { BracketError } from '..';

export interface ParserError {
  message: string;
  isEmptyExpressionError?: boolean;
  isDisallowedNodeType?: boolean;
  detailMessage?: string;
  bracketError?: BracketError;
  token?: moo.Token;
  line?: number;
  column?: number;
  expected?: string[];
  source?: string;
}

export type ParsedBlock =
  | { solution: AST.Block; error?: undefined }
  | { solution?: undefined; error: ParserError };

export type ParsedStatement =
  | { solution: AST.Statement; error?: undefined }
  | { solution?: undefined; error: ParserError };

export type ParsedExpression =
  | { solution: AST.Expression; error?: undefined }
  | { solution?: undefined; error: ParserError };
