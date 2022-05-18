import { MyElement } from '@decipad/editor-types';
import { AST, UnparsedBlock } from '@decipad/computer';

interface NameAndExpression {
  name: string;
  expression: AST.Expression;
}

interface InteractiveLanguageElementBase {
  type: string;
}

type ExpressionInteractiveLanguageElement = InteractiveLanguageElementBase & {
  resultsInExpression: true;
  resultsInNameAndExpression?: false;
  resultsInUnparsedBlock?: false;
  isStructural?: false;
  getExpressionFromElement: (element: MyElement) => AST.Expression | null;
};

type NameAndExpressionInteractiveLanguageElement =
  InteractiveLanguageElementBase & {
    resultsInExpression?: false;
    resultsInNameAndExpression: true;
    resultsInUnparsedBlock?: false;
    isStructural?: false;
    getNameAndExpressionFromElement: (
      element: MyElement
    ) => NameAndExpression | null;
  };

type UnparsedBlockInteractiveLanguageElement =
  InteractiveLanguageElementBase & {
    resultsInExpression?: false;
    resultsInNameAndExpression?: false;
    resultsInUnparsedBlock: true;
    isStructural?: false;
    getUnparsedBlockFromElement: (element: MyElement) => UnparsedBlock | null;
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
