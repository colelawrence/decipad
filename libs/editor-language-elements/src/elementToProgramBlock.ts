import { Element, Node } from '@decipad/editor-types';
import { AST, ProgramBlock } from '@decipad/computer';
import { astNode } from '@decipad/editor-utils';
import { interactiveElementsByElementType } from './interactiveElements';

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

const mapChildAsElement = (e: Node) => elementToLanguageBlock(e as Element);

export const elementToLanguageBlock = (
  element: Element
): ProgramBlock[] | null => {
  const interactiveElement = interactiveElementsByElementType[element.type];
  if (!interactiveElement) {
    return null;
  }

  if (interactiveElement.isStructural) {
    return element.children
      .map(mapChildAsElement)
      .filter(Boolean)
      .flat() as ProgramBlock[];
  }

  if (interactiveElement.resultsInExpression) {
    const exp = interactiveElement.getExpressionFromElement(element);
    if (!exp) {
      return null;
    }
    return [
      {
        type: 'parsed-block',
        id: element.id,
        block: {
          type: 'block',
          id: element.id,
          args: [exp],
        },
      },
    ];
  }

  // blocks that return (name, element) pairs:
  if (interactiveElement.resultsInNameAndExpression) {
    const nameAndExpression =
      interactiveElement.getNameAndExpressionFromElement(element);
    if (!nameAndExpression) {
      return null;
    }
    const { name, expression } = nameAndExpression;
    return [
      {
        type: 'parsed-block',
        id: element.id,
        block: getAssignmentBlock(element.id, name, expression),
      },
    ];
  }

  // blocks that return unparsed code:
  if (interactiveElement.resultsInUnparsedBlock) {
    const unparsedBlock =
      interactiveElement.getUnparsedBlockFromElement(element);
    if (!unparsedBlock) {
      return null;
    }
    return [unparsedBlock];
  }

  return null;
};
