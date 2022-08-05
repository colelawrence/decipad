import { MyEditor, MyElement } from '@decipad/editor-types';
import { AST, ProgramBlock } from '@decipad/computer';
import { astNode } from '@decipad/editor-utils';
import { isElement } from '@udecode/plate';
import * as interactiveLanguageElements from './elements';

import { InteractiveLanguageElement, ParseError } from './types';

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

const interactiveElementsByType = new Map(
  (
    Object.values(interactiveLanguageElements) as InteractiveLanguageElement[]
  ).map((element) => [element.type, element])
);

interface LanguageBlock {
  program: ProgramBlock[];
  parseErrors: ParseError[];
}

/**
 * Given an element, what are the language expressions, blocks or assignments that it represents?
 *
 * The result of this function, called once an element changes, is fed into the computer.
 */
export const elementToLanguageBlock = (
  editor: MyEditor,
  element: MyElement
): LanguageBlock | null => {
  const interactiveElement = interactiveElementsByType.get(element.type);
  if (!interactiveElement) {
    return null;
  }

  if (interactiveElement.isStructural) {
    const blocks = element.children.flatMap((node) =>
      isElement(node) ? elementToLanguageBlock(editor, node) ?? [] : []
    );

    // HACK: paragraphs can have non-element decorations (magic numbers) as well as themselves being structural
    if (interactiveElement.getUnparsedBlockFromElement) {
      const moreBlocks = interactiveElement
        .getUnparsedBlockFromElement(editor, element)
        .map((program) => ({ program: [program], parseErrors: [] }));

      blocks.push(...moreBlocks);
    }

    return flattenLanguageBlocks(blocks);
  }

  if (interactiveElement.resultsInExpression) {
    const result: LanguageBlock[] = interactiveElement
      .getExpressionFromElement(editor, element)
      .map(({ expression, parseErrors = [], id }) => {
        return {
          program: expression
            ? [
                {
                  type: 'parsed-block',
                  id,
                  block: { type: 'block', id, args: [expression] },
                },
              ]
            : [],
          parseErrors,
        };
      });

    return flattenLanguageBlocks(result);
  }

  // blocks that return (name, element) pairs:
  if (interactiveElement.resultsInNameAndExpression) {
    const nameAndExpression: LanguageBlock[] = interactiveElement
      .getNameAndExpressionFromElement(editor, element)
      .flatMap(({ name, expression, id, parseErrors = [] }) => {
        return {
          program: expression
            ? [
                {
                  type: 'parsed-block',
                  id,
                  block: getAssignmentBlock(id, name, expression),
                },
              ]
            : [],
          parseErrors,
        };
      });

    return flattenLanguageBlocks(nameAndExpression);
  }

  // blocks that return unparsed code:
  if (interactiveElement.resultsInUnparsedBlock) {
    const program = interactiveElement.getUnparsedBlockFromElement(
      editor,
      element
    );
    return { program, parseErrors: [] };
  }

  return null;
};

function flattenLanguageBlocks(items: LanguageBlock[]): LanguageBlock {
  const program: LanguageBlock['program'] = [];
  const parseErrors: LanguageBlock['parseErrors'] = [];

  for (const item of items) {
    program.push(...item.program);
    parseErrors.push(...item.parseErrors);
  }

  return { program, parseErrors };
}
