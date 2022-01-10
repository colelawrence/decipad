import { BracketError } from '..';
import * as AST from './ast-types';

export interface UnparsedBlock {
  id: string;
  source: string;
}

export interface ParserError {
  blockId: string;
  message: string;
  bracketError?: BracketError;
  token?: moo.Token;
}

export interface ParsedBlock {
  id: string;
  solutions: Solution[];
  errors: ParserError[];
}

export type Solution = AST.Block;
