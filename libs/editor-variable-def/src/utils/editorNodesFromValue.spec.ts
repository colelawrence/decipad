import { editorNodesFromValue } from './editorNodesFromValue';

it('puts the text into a line node', () => {
  expect(editorNodesFromValue('id', '123 bananas')).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "123 bananas",
          },
        ],
        "id": "id",
        "type": "code_line",
      },
    ]
  `);
});
