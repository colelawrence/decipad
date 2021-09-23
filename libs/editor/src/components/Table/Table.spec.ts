import { createEditor } from 'slate';
import { InteractiveTable } from '../../plugins/InteractiveTable/table';
import { createTable } from '../../test-utils/table';
import { addRow } from './Table';

describe('addRow', () => {
  it('adds a row with empty cells after the currently selected one', () => {
    const editor = createEditor();
    editor.children = [createTable(3)];
    editor.selection = {
      focus: { path: [0, 2, 1, 0], offset: 0 },
      anchor: { path: [0, 2, 1, 0], offset: 0 },
    };

    addRow(editor);

    const table = editor.children[0] as InteractiveTable;
    expect(table.children[2].children).toHaveLength(4);

    const [, , thirdRow] = table.children[2].children;
    expect(thirdRow.children).toHaveLength(1);

    const [newCell] = thirdRow.children;
    expect(newCell.children[0].text).toBe('');
  });
});
