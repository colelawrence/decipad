import { MyEditor, MyElement } from '@decipad/editor-types';
import { AST, Computer, UnparsedBlock } from '@decipad/computer';

interface NameAndExpression {
  name: string;
  id: string;
  expression?: AST.Expression;
  parseErrors?: ParseError[];
}

interface JustExpression {
  id: string;
  expression?: AST.Expression;
  parseErrors?: ParseError[];
}

interface InteractiveLanguageElementBase {
  type: string | string[];
}

type ExpressionInteractiveLanguageElement = InteractiveLanguageElementBase & {
  resultsInExpression: true;
  resultsInNameAndExpression?: false;
  resultsInUnparsedBlock?: false;
  isStructural?: false;
  getExpressionFromElement: (
    editor: MyEditor,
    computer: Computer,
    element: MyElement
  ) => Promise<JustExpression[]>;
};

export type NameAndExpressionInteractiveLanguageElement =
  InteractiveLanguageElementBase & {
    resultsInExpression?: false;
    resultsInNameAndExpression: true;
    resultsInUnparsedBlock?: false;
    isStructural?: false;
    getNameAndExpressionFromElement: (
      editor: MyEditor,
      computer: Computer,
      element: MyElement
    ) => Promise<NameAndExpression[]>;
  };

type UnparsedBlockInteractiveLanguageElement =
  InteractiveLanguageElementBase & {
    resultsInExpression?: false;
    resultsInNameAndExpression?: false;
    resultsInUnparsedBlock: true;
    isStructural?: false;
    getUnparsedBlockFromElement: (
      editor: MyEditor,
      computer: Computer,
      element: MyElement
    ) => Promise<UnparsedBlock[]>;
  };

type StructuralElement = InteractiveLanguageElementBase & {
  isStructural: true;
  resultsInExpression?: false;
  resultsInNameAndExpression?: false;
  resultsInUnparsedBlock?: true;
  getUnparsedBlockFromElement?: (
    editor: MyEditor,
    computer: Computer,
    element: MyElement
  ) => Promise<UnparsedBlock[]>;
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
