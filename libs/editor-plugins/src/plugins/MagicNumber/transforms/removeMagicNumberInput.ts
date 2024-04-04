import type { TElement } from '@udecode/plate-common';
import {
  getNode,
  insertText,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import type { Path } from 'slate';
import type { MyEditor } from '@decipad/editor-types';

export const removeMagicNumberInput = (editor: MyEditor, path: Path) =>
  withoutNormalizing(editor, () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { trigger } = getNode<TElement>(editor, path)!;

    insertText(editor, trigger as string, {
      at: { path: [...path, 0], offset: 0 },
    });
    unwrapNodes(editor, {
      at: path,
    });
  });
