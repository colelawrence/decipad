import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { decorateCodeLine } from './decorateCodeLine';

it('decorates code line', () => {
  const node = {
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: '123 bananas',
      },
    ],
  };
  const path = [0];
  expect(decorateCodeLine()([node, path])).toMatchInlineSnapshot(`
    Array [
      Object {
        "anchor": Object {
          "offset": 0,
          "path": Array [
            0,
            0,
          ],
        },
        "code_syntax": true,
        "focus": Object {
          "offset": 3,
          "path": Array [
            0,
            0,
          ],
        },
        "tokenType": "number",
      },
      Object {
        "anchor": Object {
          "offset": 3,
          "path": Array [
            0,
            0,
          ],
        },
        "code_syntax": true,
        "focus": Object {
          "offset": 4,
          "path": Array [
            0,
            0,
          ],
        },
        "tokenType": "ws",
      },
      Object {
        "anchor": Object {
          "offset": 4,
          "path": Array [
            0,
            0,
          ],
        },
        "code_syntax": true,
        "focus": Object {
          "offset": 11,
          "path": Array [
            0,
            0,
          ],
        },
        "tokenType": "identifier",
      },
    ]
    `);
});
