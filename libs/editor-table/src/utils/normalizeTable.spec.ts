import { MyEditor, TableElement } from '@decipad/editor-types';
import { insertTableBelow } from '@decipad/editor-components';
import { createTEditor, getNodeEntry, TNodeEntry } from '@udecode/plate';
import { normalizeTable } from './normalizeTable';

const getAvailableIdentifier = (prefix: string, start: number) =>
  `${prefix}${start}`;

describe('normalizeTable', () => {
  let editor!: MyEditor;

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
    await insertTableBelow(editor, [0], getAvailableIdentifier);

    const tableEntry: TNodeEntry<TableElement> = getNodeEntry(editor, {
      path: [1],
      offset: 0,
    });

    const normalizedTable = normalizeTable(editor, tableEntry);

    expect(normalizedTable).toBe(true);
  });
});
