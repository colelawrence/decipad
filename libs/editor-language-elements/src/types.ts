import { Element } from '@decipad/editor-types';
import { AST, UnparsedBlock } from '@decipad/language';

interface NameAndExpression {
  name: string;
  expression: AST.Expression;
}

interface InteractiveLanguageElementBase {
  type: string;
}

type NameAndExpressionInteractiveLanguageElement =
  InteractiveLanguageElementBase & {
    resultsInNameAndExpression: true;
    resultsInUnparsedBlock?: false;
    isStructural?: false;
    getNameAndExpressionFromElement: (
      element: Element
    ) => NameAndExpression | null;
  };

type UnparsedBlockInteractiveLanguageElement =
  InteractiveLanguageElementBase & {
    resultsInNameAndExpression?: false;
    resultsInUnparsedBlock: true;
    isStructural?: false;
    getUnparsedBlocksFromElement: (element: Element) => UnparsedBlock[];
  };

type StructuralElement = InteractiveLanguageElementBase & {
  isStructural: true;
};

export type InteractiveLanguageElement =
  | NameAndExpressionInteractiveLanguageElement
  | UnparsedBlockInteractiveLanguageElement
  | StructuralElement;
