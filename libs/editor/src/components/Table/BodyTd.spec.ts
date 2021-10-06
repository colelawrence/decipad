import { createEditor } from 'slate';
import { InteractiveTable } from '../../plugins/InteractiveTable/table';
import { createTableWithTypeAndData, printTable } from '../../test-utils/table';
import { validateNumber } from './BodyTd';

describe('validateNumber', () => {
  it('clears non-numeric cells if the type is number', () => {
    const editor = createEditor();
    editor.children = [
      createTableWithTypeAndData('number', ['invalidnum', '123']),
    ];

    validateNumber(editor, [0, 2, 0, 0]);

    expect(printTable(editor.children[0] as InteractiveTable))
      .toMatchInlineSnapshot(`
        Array [
          "Col 1",
          "",
          "123",
        ]
      `);
  });
});
