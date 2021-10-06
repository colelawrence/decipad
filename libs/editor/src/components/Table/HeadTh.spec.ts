import { createEditor } from 'slate';
import { InteractiveTable } from '../../plugins/InteractiveTable/table';
import { createTable, printTable } from '../../test-utils/table';
import { changeColumnType } from './HeadTh';

describe('changeColumnType', () => {
  it('places cellType attribute into TH and TDs', () => {
    const editor = createEditor();
    editor.children = [createTable(1)];

    changeColumnType(editor, [0, 1, 0, 0], 'number');

    const table = editor.children[0] as InteractiveTable;

    const th = table.children[1].children[0].children[0];
    const td = table.children[2].children[0].children[0];

    expect(th.attributes?.cellType).toEqual('number');
    expect(td.attributes?.cellType).toEqual('number');
  });

  it('cleans non-numeric cells', () => {
    const editor = createEditor();
    const createdTable = createTable(2);
    createdTable.children[2].children[0].children[0].children[0].text = '1234';
    editor.children = [createdTable];

    changeColumnType(editor, [0, 1, 0, 0], 'number');

    expect(printTable(editor.children[0] as InteractiveTable))
      .toMatchInlineSnapshot(`
        Array [
          "Col 1",
          "1234",
          "",
        ]
      `);
  });
});
