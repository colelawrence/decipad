import { beforeEach, expect, describe, it } from 'vitest';
import { insertTableBelow } from '@decipad/editor-components';
import type { MyEditor, MyValue, TableElement } from '@decipad/editor-types';
import { getNodeEntrySafe } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { createTEditor } from '@udecode/plate-common';
import { getComputer } from '@decipad/computer';
import type { NodeEntry } from 'slate';
import { normalizeTable } from './normalizeTable';

const getAvailableIdentifier = (prefix: string, start?: number) =>
  `${prefix}${start}`;

describe('normalizeTable', () => {
  let editor!: MyEditor;
  const computer = getComputer();

  beforeEach(() => {
    editor = createTEditor() as MyEditor;
    editor.children = [
      {
        type: 'p',
        id: 'asdf',
        children: [{ text: '' }],
      } as never,
    ];
  });

  it('should normalize a table', async () => {
    insertTableBelow(editor, [0], getAvailableIdentifier);

    const tableEntry = getDefined(
      getNodeEntrySafe(editor, {
        path: [1],
        offset: 0,
      })
    ) as NodeEntry<TableElement>;
    const normalizedTable = normalizeTable<MyValue>(
      editor,
      computer,
      tableEntry
    );

    expect(normalizedTable).not.toBe(false);
  });
});
