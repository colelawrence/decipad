import type { ImportElement, ImportElementSource } from '@decipad/editor-types';
import { ELEMENT_IMPORT } from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import type { PlateEditor } from '@udecode/plate-common';
import { isCollapsed } from '@udecode/plate-common';
import { nanoid } from 'nanoid';

export const insertImport = (
  editor: PlateEditor,
  source: ImportElementSource,
  url: string,
  createdByUserId: string
) => {
  const { selection } = editor;
  if (isCollapsed(selection) && selection?.anchor) {
    const fetchEl: ImportElement = {
      id: nanoid(),
      type: ELEMENT_IMPORT,
      createdByUserId,
      url,
      source,
      children: [{ text: '' }],
    };
    insertNodes(editor, [fetchEl], {
      at: requirePathBelowBlock(editor, selection.anchor.path),
    });
  }
};
