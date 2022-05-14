import { tolerantParser } from './index';

it('can parse numbers', () => {
  expect(tolerantParser('1234')).toMatchInlineSnapshot(`
    Array [
      Object {
        "col": 1,
        "line": 1,
        "lineBreaks": 0,
        "offset": 0,
        "text": "1234",
        "toString": [Function],
        "type": "number",
        "value": "1234",
      },
    ]
  `);
});
