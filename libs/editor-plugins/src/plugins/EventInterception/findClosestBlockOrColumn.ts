import type { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { ELEMENT_COLUMNS } from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { last } from '@decipad/utils';
import { getLevels, isElement } from '@udecode/plate-common';
import type { Path } from 'slate';

export function findClosestBlockOrColumn(
  editor: MyEditor,
  path: Path
): MyNodeEntry | undefined {
  const ancestors = [
    ...getLevels(editor, {
      match: isElement,
      at: path,
      reverse: true,
    }),
  ] as MyNodeEntry[];

  return (
    ancestors.find((entry) => isElementOfType(entry[0], ELEMENT_COLUMNS)) ??
    last(ancestors)
  );
}
