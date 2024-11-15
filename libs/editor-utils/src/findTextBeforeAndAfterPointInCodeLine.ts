import type { MyElement, MyNode } from '@decipad/editor-types';
import { ELEMENT_SMART_REF } from '@decipad/editor-types';
import { Path, Point } from 'slate';
import { getNodeString, isElement } from '@udecode/plate-common';

export const findTextBeforeAndAfterPointInCodeLine = (
  blockAbove: MyElement,
  blockAbovePath: Path,
  { path, offset }: Point
) => {
  const [myBlockIndex] = Path.relative(path, blockAbovePath);
  if (myBlockIndex == null) {
    return;
  }

  const blocksBefore = blockAbove.children.slice(0, myBlockIndex);
  const blocksAfter = blockAbove.children.slice(myBlockIndex + 1);
  const blockItself = blockAbove.children[myBlockIndex];

  if (blockItself == null) {
    return;
  }

  const getText = (blocks: MyNode[]): string =>
    blocks.reduce(
      (acc, item) =>
        acc +
        (isElement(item) && item.type === ELEMENT_SMART_REF
          ? 'smartrefplaceholder'
          : getNodeString(item)),
      ''
    );

  const textBefore =
    getText(blocksBefore) + getText([blockItself]).slice(0, offset);
  const textAfter = getText([blockItself]).slice(offset) + getText(blocksAfter);

  return { textBefore, textAfter };
};
