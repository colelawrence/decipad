import { MyEditor, MyElement } from '@decipad/editor-types';
import { AST, UnparsedBlock } from '@decipad/computer';

interface NameAndExpression {
  name: string;
  expression?: AST.Expression;
  parseErrors?: ParseError[];
}

interface InteractiveLanguageElementBase {
  type: string;
}

type ExpressionInteractiveLanguageElement = InteractiveLanguageElementBase & {
  resultsInExpression: true;
  resultsInNameAndExpression?: false;
  resultsInUnparsedBlock?: false;
  isStructural?: false;
  getExpressionFromElement: (
    editor: MyEditor,
    element: MyElement
  ) => { expression: AST.Expression; parseErrors?: ParseError[] } | null;
};

type NameAndExpressionInteractiveLanguageElement =
  InteractiveLanguageElementBase & {
    resultsInExpression?: false;
    resultsInNameAndExpression: true;
    resultsInUnparsedBlock?: false;
    isStructural?: false;
    getNameAndExpressionFromElement: (
      editor: MyEditor,
      element: MyElement
    ) => NameAndExpression | null;
  };

type UnparsedBlockInteractiveLanguageElement =
  InteractiveLanguageElementBase & {
    resultsInExpression?: false;
    resultsInNameAndExpression?: false;
    resultsInUnparsedBlock: true;
    isStructural?: false;
    getUnparsedBlockFromElement: (
      editor: MyEditor,
      element: MyElement
    ) => UnparsedBlock | null;
  };

type StructuralElement = InteractiveLanguageElementBase & {
  isStructural: true;
  resultsInExpression?: false;
  resultsInNameAndExpression?: false;
  resultsInUnparsedBlock?: true;
};

export type InteractiveLanguageElement =
  | ExpressionInteractiveLanguageElement
  | NameAndExpressionInteractiveLanguageElement
  | UnparsedBlockInteractiveLanguageElement
  | StructuralElement;

export interface ParseError {
  elementId: string;
  error: string;
}
