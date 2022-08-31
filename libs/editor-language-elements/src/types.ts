import type { MyEditor, MyElement } from '@decipad/editor-types';
import type { AST, Computer } from '@decipad/computer';
import { IdentifiedBlock } from 'libs/computer/src/types';

export interface ParsedStatement {
  id: string;
  statement?: AST.Expression | AST.Statement;
  parseErrors?: ParseError[];
}

interface JustExpression {
  id: string;
  expression?: AST.Expression;
  parseErrors?: ParseError[];
}

export type InteractiveLanguageElement = {
  getParsedBlockFromElement?: (
    editor: MyEditor,
    computer: Computer,
    element: MyElement
  ) => Promise<LanguageBlock[]>;
  getExpressionFromElement?: (
    editor: MyEditor,
    computer: Computer,
    element: MyElement
  ) => Promise<JustExpression[]>;
  type: string | string[];
  isStructural?: boolean;
};

export interface ParseError {
  elementId: string;
  error: string;
}

export interface LanguageBlock {
  program: IdentifiedBlock[];
  parseErrors: ParseError[];
}
