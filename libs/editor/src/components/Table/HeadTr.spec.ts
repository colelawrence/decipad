import { createEditor } from 'slate';
import { InteractiveTable } from '../../plugins/InteractiveTable/table';
import { createTable } from '../../test-utils/table';
import { addColumn } from './HeadTr';

describe('addColumn', () => {
  it('adds a trailing empty head cell to the right', () => {
    const editor = createEditor();
    editor.children = [createTable(1)];
    editor.selection = {
      focus: { path: [0, 1], offset: 0 },
      anchor: { path: [0, 1], offset: 0 },
    };

    addColumn(editor);

    const table = editor.children[0] as InteractiveTable;
    expect(table.children[1].children[0].children).toHaveLength(2);

    const [leftHead, rightHead] = table.children[1].children[0].children;
    expect(leftHead.children[0].text).not.toBe('');
    expect(rightHead.children[0].text).toBe('');
  });

  it('adds a trailing empty body cell to every row', () => {
    const editor = createEditor();
    editor.children = [createTable(2)];
    editor.selection = {
      focus: { path: [0, 1], offset: 0 },
      anchor: { path: [0, 1], offset: 0 },
    };

    addColumn(editor);

    const table = editor.children[0] as InteractiveTable;
    const [firstRow, secondRow] = table.children[2].children;

    expect(firstRow.children.map((cell) => cell.children[0].text)).toEqual([
      expect.stringMatching(/.+/),
      '',
    ]);
    expect(secondRow.children.map((cell) => cell.children[0].text)).toEqual([
      expect.stringMatching(/.+/),
      '',
    ]);
  });
});
