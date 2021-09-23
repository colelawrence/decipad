import { createEditor } from 'slate';
import { InteractiveTable } from '../../plugins/InteractiveTable/table';
import { createTable } from '../../test-utils/table';
import { removeRow } from './BodyTr';

describe('removeRow', () => {
  it('removes the specified row', () => {
    const editor = createEditor();
    editor.children = [createTable(2)];

    removeRow(editor, [0, 2, 0]);

    const table = editor.children[0] as InteractiveTable;
    expect(table.children[2].children).toHaveLength(1);

    const [onlyRow] = table.children[2].children;
    expect(onlyRow.children.map((cell) => cell.children[0].text)).toEqual([
      expect.stringContaining('2'),
    ]);
  });

  it('does not remove the row if it is the only one left', () => {
    const editor = createEditor();
    editor.children = [createTable(1)];

    removeRow(editor, [0, 2, 0]);
    const table = editor.children[0] as InteractiveTable;
    expect(table.children[2].children).toHaveLength(1);
  });
});
