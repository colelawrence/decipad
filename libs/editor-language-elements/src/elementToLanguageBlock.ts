import { MyEditor, MyElement, MyNode } from '@decipad/editor-types';
import { AST, ProgramBlock } from '@decipad/computer';
import { astNode } from '@decipad/editor-utils';
import { interactiveElementsByElementType } from './interactiveElements';
import { ParseError } from './types';

const getAssignmentBlock = (
  id: string,
  name: string,
  value: AST.Expression
): AST.Block => {
  return {
    type: 'block',
    id,
    args: [astNode('assign', astNode('def', name), value)],
  };
};

const mapChildAsElement = (editor: MyEditor) => (e: MyNode) =>
  elementToLanguageBlock(editor, e as MyElement);

export interface ElementToLanguageBlockReturn {
  program: ProgramBlock[];
  parseErrors: ParseError[];
}

export const elementToLanguageBlock = (
  editor: MyEditor,
  element: MyElement
): ElementToLanguageBlockReturn | null => {
  const interactiveElement = interactiveElementsByElementType[element.type];
  if (!interactiveElement) {
    return null;
  }

  if (interactiveElement.isStructural) {
    return element.children
      .map(mapChildAsElement(editor))
      .reduce<ElementToLanguageBlockReturn>(
        (
          result: ElementToLanguageBlockReturn,
          childResult: ElementToLanguageBlockReturn | null
        ) => {
          if (childResult) {
            const { program, parseErrors } = childResult;
            // eslint-disable-next-line no-param-reassign
            result.program = result.program.concat(program).flat();
            // eslint-disable-next-line no-param-reassign
            result.parseErrors = result.parseErrors.concat(parseErrors);
          }
          return result;
        },
        { program: [], parseErrors: [] }
      );
  }

  if (interactiveElement.resultsInExpression) {
    const result = interactiveElement.getExpressionFromElement(editor, element);
    if (!result) {
      return null;
    }
    return {
      program: [
        {
          type: 'parsed-block',
          id: element.id,
          block: {
            type: 'block',
            id: element.id,
            args: [result.expression],
          },
        },
      ],
      parseErrors: result.parseErrors ?? [],
    };
  }

  // blocks that return (name, element) pairs:
  if (interactiveElement.resultsInNameAndExpression) {
    const nameAndExpression =
      interactiveElement.getNameAndExpressionFromElement(editor, element);
    if (!nameAndExpression) {
      return null;
    }
    const { name, expression, parseErrors } = nameAndExpression;
    return {
      program: [
        {
          type: 'parsed-block',
          id: element.id,
          block: getAssignmentBlock(element.id, name, expression),
        },
      ],
      parseErrors: parseErrors ?? [],
    };
  }

  // blocks that return unparsed code:
  if (interactiveElement.resultsInUnparsedBlock) {
    const unparsedBlock = interactiveElement.getUnparsedBlockFromElement(
      editor,
      element
    );
    if (!unparsedBlock) {
      return null;
    }
    return {
      program: [unparsedBlock],
      parseErrors: [],
    };
  }

  return null;
};
