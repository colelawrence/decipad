import { importFromUnknownJson } from './importFromUnknownJson';

it('allows different "types" to be in the same columns', async () => {
  await expect(
    importFromUnknownJson({ hello: ['100', '200', 'not a number'] }, {})
  ).resolves.toMatchInlineSnapshot(`
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

describe('Inferring types', () => {
  it('Infers number columns', async () => {
    await expect(importFromUnknownJson({ hello: ['100', '200', '300'] }, {}))
      .resolves.toMatchInlineSnapshot(`
      {
        "type": {
          "columnNames": [
            "hello",
          ],
          "columnTypes": [
            {
              "kind": "number",
              "unit": null,
            },
          ],
          "indexName": "hello",
          "kind": "materialized-table",
        },
        "value": [
          [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 100n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 200n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 300n,
              "s": 1n,
            },
          ],
        ],
      }
    `);
  });

  it('Infers number columns with units', async () => {
    await expect(importFromUnknownJson({ price: ['$100', '$200', '$300'] }, {}))
      .resolves.toMatchInlineSnapshot(`
      {
        "type": {
          "columnNames": [
            "price",
          ],
          "columnTypes": [
            {
              "kind": "number",
              "unit": [
                {
                  "aliasFor": undefined,
                  "baseQuantity": "USD",
                  "baseSuperQuantity": "currency",
                  "exp": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                  "known": true,
                  "multiplier": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                  "unit": "$",
                },
              ],
            },
          ],
          "indexName": "price",
          "kind": "materialized-table",
        },
        "value": [
          [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 100n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 200n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 300n,
              "s": 1n,
            },
          ],
        ],
      }
    `);
  });
});

describe('single json values and infers correct type', () => {
  it('parses strings', async () => {
    await expect(importFromUnknownJson('hello', {})).resolves
      .toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "string",
        },
        "value": "hello",
      }
    `);
  });
  it('parses numbers', async () => {
    await expect(importFromUnknownJson('250', {})).resolves
      .toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 250n,
          "s": 1n,
        },
      }
    `);
  });
  it('parses booleans', async () => {
    await expect(importFromUnknownJson('true', {})).resolves
      .toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "boolean",
        },
        "value": true,
      }
    `);
  });
});

describe('Nested objects', () => {
  it('can import nested JSON objects', async () => {
    await expect(importFromUnknownJson({ hello: [{ world: 'a string' }] }, {}))
      .resolves.toMatchInlineSnapshot(`
      {
        "type": {
          "columnNames": [
            "hello",
          ],
          "columnTypes": [
            {
              "columnNames": [
                "world",
              ],
              "columnTypes": [
                {
                  "kind": "string",
                },
              ],
              "indexName": "world",
              "kind": "materialized-table",
            },
          ],
          "indexName": "hello",
          "kind": "materialized-table",
        },
        "value": [
          [
            [
              [
                "a string",
              ],
            ],
          ],
        ],
      }
    `);
  });

  it('can import some nested objects', async () => {
    await expect(
      importFromUnknownJson({ col1: 123, col2: [500, 600, 890] }, {})
    ).resolves.toMatchInlineSnapshot(`
      {
        "type": {
          "columnNames": [
            "col1",
            "col2",
          ],
          "columnTypes": [
            {
              "kind": "number",
              "unit": null,
            },
            {
              "kind": "number",
              "unit": null,
            },
          ],
          "indexName": "col1",
          "kind": "materialized-table",
        },
        "value": [
          [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 123n,
              "s": 1n,
            },
          ],
          [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 500n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 600n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 890n,
              "s": 1n,
            },
          ],
        ],
      }
    `);
  });
});

describe('edge cases', () => {
  it('doesnt infer number on non-number', async () => {
    await expect(importFromUnknownJson('aaa55ff', {})).resolves
      .toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "string",
        },
        "value": "aaa55ff",
      }
    `);
  });
});

describe('Infers dates', () => {
  it('Simple date', async () => {
    await expect(importFromUnknownJson('2024-04-16', {})).resolves
      .toMatchInlineSnapshot(`
      {
        "type": {
          "date": "day",
          "kind": "date",
        },
        "value": 1713225600000n,
      }
    `);
  });
});
