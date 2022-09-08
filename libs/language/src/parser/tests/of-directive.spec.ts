import { parseOneStatement } from '../..';

it('parses of directive', () => {
  expect(parseOneStatement('grams of butter')).toMatchInlineSnapshot(`
    Object {
      "args": Array [
        "of",
        Object {
          "args": Array [
            "grams",
          ],
          "end": Object {
            "char": 4,
            "column": 5,
            "line": 1,
          },
          "start": Object {
            "char": 0,
            "column": 1,
            "line": 1,
          },
          "type": "ref",
        },
        Object {
          "args": Array [
            "butter",
          ],
          "end": Object {
            "char": 14,
            "column": 15,
            "line": 1,
          },
          "start": Object {
            "char": 9,
            "column": 10,
            "line": 1,
          },
          "type": "generic-identifier",
        },
      ],
      "end": Object {
        "char": 14,
        "column": 15,
        "line": 1,
      },
      "start": Object {
        "char": 0,
        "column": 1,
        "line": 1,
      },
      "type": "directive",
    }
  `);
});
