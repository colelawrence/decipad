import { importFromUnknownJson } from './importFromUnknownJson';

it('allows different "types" to be in the same columns', () => {
  expect(importFromUnknownJson({ hello: ['100', '200', 'not a number'] }, {}))
    .toMatchInlineSnapshot(`
    {
      "type": {
        "columnNames": [
          "hello",
        ],
        "columnTypes": [
          {
            "kind": "string",
          },
        ],
        "indexName": "hello",
        "kind": "materialized-table",
      },
      "value": [
        [
          "100",
          "200",
          "not a number",
        ],
      ],
    }
  `);
});
