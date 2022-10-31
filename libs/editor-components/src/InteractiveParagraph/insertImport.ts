import { Computer } from '@decipad/computer';
import {
  ELEMENT_IMPORT,
  ImportElement,
  ImportElementSource,
  MyEditor,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { tryImport } from '@decipad/import';
import {
  insertNodes,
  isCollapsed,
  setSelection,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';

export interface InsertImportProps {
  computer: Computer;
  editor: MyEditor;
  source?: ImportElementSource;
  url?: string;
  identifyIslands?: boolean;
}

export const insertImport = async ({
  computer,
  editor,
  source,
  url,
  identifyIslands,
}: InsertImportProps) => {
  const { selection } = editor;

  if (isCollapsed(selection) && selection?.anchor && url) {
    const imports = await tryImport(computer, new URL(url), source, {
      identifyIslands,
    });
    const insertPath = requirePathBelowBlock(editor, selection.anchor.path);
    const selBefore = selection;

    withoutNormalizing(editor, () => {
      for (const imp of imports) {
        const fetchEl: ImportElement = {
          id: nanoid(),
          type: ELEMENT_IMPORT,
          url: imp.meta?.sourceUrl?.toString() ?? url,
          source,
          children: [{ text: '' }],
        };

        insertNodes(editor, fetchEl, {
          at: insertPath,
        });
      }
      setSelection(editor, selBefore);
    });
  }
};
