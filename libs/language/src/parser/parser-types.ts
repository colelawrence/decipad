import { BracketError } from '..';
import * as AST from './ast-types';

export interface ParserError {
  message: string;
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
