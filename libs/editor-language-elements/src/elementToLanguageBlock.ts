import type { MyEditor, MyElement } from '@decipad/editor-types';
import type { Program, RemoteComputer } from '@decipad/remote-computer';
import { isElement } from '@udecode/plate';

import * as interactiveLanguageElements from './elements';
import type { InteractiveLanguageElement } from './types';

export const interactiveElementsByType = (() => {
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

export const interactiveElementTypes = new Set(
  interactiveElementsByType.keys()
);

/**
 * Given an element, what are the language expressions, blocks or assignments that it represents?
 *
 * The result of this function, called once an element changes, is fed into the computer.
 */
export const elementToLanguageBlocks = async (
  editor: MyEditor,
  computer: RemoteComputer,
  element: MyElement
): Promise<Program | null> => {
  const interactiveElement = interactiveElementsByType.get(element.type);
  if (!interactiveElement) {
    return null;
  }

  const blocks: Program = [];
  if (interactiveElement.isStructural) {
    for (const child of element.children) {
      if (isElement(child)) {
        blocks.push(
          // eslint-disable-next-line no-await-in-loop
          ...((await elementToLanguageBlocks(editor, computer, child)) ?? [])
        );
      }
    }
  }

  // blocks that return code:
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
      console.error('Error happened on element', element);
    }
  }

  return blocks;
};
