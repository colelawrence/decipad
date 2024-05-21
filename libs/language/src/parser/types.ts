import type { AST } from '@decipad/language-interfaces';

export interface ParserNode {
  type: string;
  location?: number;
  length?: number;
  args: ParserNode[] | AST.Node[];
  start: AST.Pos;
  end: AST.Pos;
}
