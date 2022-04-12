import { editorNodesFromValue } from './editorNodesFromValue';

it('puts the text into a line node', () => {
  expect(editorNodesFromValue('id', '123 bananas')).toMatchInlineSnapshot(`
    Array [
      Object {
        "children": Array [
          Object {
            "text": "123 bananas",
          },
        ],
        "id": "id",
        "type": "code_line",
      },
    ]
    `);
});
