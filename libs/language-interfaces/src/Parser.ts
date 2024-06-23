import type moo from 'moo';
import type { AST, SerializedType, Time } from '.';

export type BracketError =
  | { type: 'never-opened'; close: moo.Token }
  | { type: 'mismatched-brackets'; open: moo.Token; close: moo.Token }
  | { type: 'never-closed'; open: moo.Token };

export interface ParserError {
  message: string;
  isEmptyExpressionError?: boolean;
  isDisallowedNodeType?: boolean;
  detailMessage?: string;
  bracketError?: BracketError;
  token?: moo.Token | undefined;
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

export interface Parseable {
  varName?: string;
  kind: Exclude<SerializedType['kind'], 'date'>;
}

export interface ParseableDate {
  varName?: string;
  kind: 'date';
  dateStr: string;
  dateGranularity: Time.Specificity;
}
