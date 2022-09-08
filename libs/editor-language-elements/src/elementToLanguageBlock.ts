import { MyEditor, MyElement } from '@decipad/editor-types';
import type { Computer } from '@decipad/computer';
import { isElement } from '@udecode/plate';

import * as interactiveLanguageElements from './elements';
import type { InteractiveLanguageElement, LanguageBlock } from './types';

const interactiveElementsByType = (() => {
  const map: Array<[string, InteractiveLanguageElement]> = [];
  for (const el of Object.values(
    interactiveLanguageElements
  ) as InteractiveLanguageElement[]) {
    for (const t of [el.type].flat()) {
      map.push([t, el]);
    }
  }
  return new Map<string, InteractiveLanguageElement>(map);
})();

/**
 * Given an element, what are the language expressions, blocks or assignments that it represents?
 *
 * The result of this function, called once an element changes, is fed into the computer.
 */
export const elementToLanguageBlock = async (
  editor: MyEditor,
  computer: Computer,
  element: MyElement
): Promise<LanguageBlock | null> => {
  const interactiveElement = interactiveElementsByType.get(element.type);
  if (!interactiveElement) {
    return null;
  }

  let blocks: LanguageBlock[] = [];
  if (interactiveElement.isStructural) {
    blocks = (
      await Promise.all(
        element.children.flatMap(async (node) =>
          isElement(node)
            ? (await elementToLanguageBlock(editor, computer, node)) ?? []
            : []
        )
      )
    )
      .flat()
      .filter(Boolean);
  }

  if (interactiveElement.getExpressionFromElement) {
    const moreBlocks: LanguageBlock[] = (
      await interactiveElement.getExpressionFromElement(
        editor,
        computer,
        element
      )
    ).map(({ expression, parseErrors = [], id }) => {
      return {
        program: expression
          ? [
              {
                type: 'identified-block',
                id,
                source: '',
                block: { type: 'block', id, args: [expression] },
              },
            ]
          : [],
        parseErrors,
      };
    });

    blocks.push(...moreBlocks);
  }

  // blocks that return unparsed code:
  if (interactiveElement.getParsedBlockFromElement) {
    try {
      blocks.push(
        ...(await interactiveElement.getParsedBlockFromElement(
          editor,
          computer,
          element
        ))
      );
    } catch (err) {
      console.error('Error getting parsed block from element', err);
    }
  }

  return flattenLanguageBlocks(blocks);
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
