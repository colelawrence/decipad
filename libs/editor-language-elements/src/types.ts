import { AST, Computer, SerializedType } from '@decipad/computer';
import { MyEditor, MyElement } from '@decipad/editor-types';
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

export interface CoercibleType {
  type: SerializedType;
  coerced: string;
}
