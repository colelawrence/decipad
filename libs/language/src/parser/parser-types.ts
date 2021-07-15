import * as AST from './ast-types';

export interface UnparsedBlock {
  id: string;
  source: string;
}

export interface ParserError {
  message: string;
  details: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}

export interface ParsedBlock {
  id: string;
  solutions: Solution[];
  errors: ParserError[];
}

export type Solution = AST.Block;
