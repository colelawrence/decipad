import { expect, describe, it } from 'vitest';
import { evaluateForVariables } from './testUtils';

const evalOptions = {
  typesAsUser: true,
  valuesAsUser: true,
  continueOnTypeErrors: true,
};

describe('table join', () => {
  it('errors when passed not a column', async () => {
    await expect(async () => {
      return evaluateForVariables(
        `
        JoinResult = join(3)
      `,
        ['JoinResult'],
        evalOptions
      );
    }).rejects.toThrow('expected-but-got');
  });

  it('errors when passed not a column of booleans', async () => {
    await expect(async () => {
      return evaluateForVariables(
        `
        JoinResult = join([1, 2, 3])
      `,
        ['JoinResult'],
        evalOptions
      );
    }).rejects.toThrow('expected-but-got');
  });

  it('errors when passed not a column of booleans without source table', async () => {
    await expect(async () => {
      return evaluateForVariables(
        `
        JoinResult = join([true, false])
      `,
        ['JoinResult'],
        evalOptions
      );
    }).rejects.toThrow('Could not find table to join on');
  });

  it('can join table with itself', async () => {
    const results = await evaluateForVariables(
      `
        Table = { a = [1, 2, 3], b = [true, false, true] }
        JoinResult = join(Table.a == Table.a)
      `,
      ['JoinResult'],
      evalOptions
    );
    const joinResult = results.JoinResult;
    expect(joinResult.type).toMatchInlineSnapshot(`
      {
        "columnNames": [
          "a",
          "b",
        ],
        "columnTypes": [
          {
            "kind": "number",
            "unit": null,
          },
          {
            "kind": "boolean",
          },
        ],
        "delegatesIndexTo": "Table",
        "indexName": "JoinResult",
        "kind": "table",
      }
    `);

    expect(joinResult.value).toMatchInlineSnapshot(`
      [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
        ],
        [
          true,
          false,
          true,
        ],
      ]
    `);
  });

  it('can join 2 tables', async () => {
    const results = await evaluateForVariables(
      `
        Table1 = { a = [1, 2, 3], b = [true, false, true] }
        Table2 = { a = ["A", "B", "C"], b = [1, 2, 4] }
        JoinResult = join(Table1.a == Table2.b)
      `,
      ['JoinResult'],
      evalOptions
    );
    const joinResult = results.JoinResult;
    expect(joinResult.type).toMatchInlineSnapshot(`
      {
        "columnNames": [
          "a",
          "b",
          "Table2_a",
          "Table2_b",
        ],
        "columnTypes": [
          {
            "kind": "number",
            "unit": null,
          },
          {
            "kind": "boolean",
          },
          {
            "kind": "string",
          },
          {
            "kind": "number",
            "unit": null,
          },
        ],
        "delegatesIndexTo": "Table1",
        "indexName": "JoinResult",
        "kind": "table",
      }
    `);

    expect(joinResult.value).toHaveLength(4);
    expect(joinResult.value).toMatchInlineSnapshot(`
      [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
        [
          true,
          false,
        ],
        [
          "A",
          "B",
        ],
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      ]
    `);
  });

  it('can join 3 tables', async () => {
    const results = await evaluateForVariables(
      `
        Table1 = { a = [1, 2, 3], b = [true, false, true] }
        Table2 = { a = [true, false, true], b = [1, 2, 3] }
        Table3 = { a = [true, false, true], c = [1, 2, 3] }
        JoinResult = join(Table1.a == Table2.b and Table1.a == Table3.c)
      `,
      ['JoinResult'],
      evalOptions
    );
    const joinResult = results.JoinResult;
    expect(joinResult.type).toMatchInlineSnapshot(`
      {
        "columnNames": [
          "a",
          "b",
          "Table2_a",
          "Table2_b",
          "Table3_a",
          "Table3_c",
        ],
        "columnTypes": [
          {
            "kind": "number",
            "unit": null,
          },
          {
            "kind": "boolean",
          },
          {
            "kind": "boolean",
          },
          {
            "kind": "number",
            "unit": null,
          },
          {
            "kind": "boolean",
          },
          {
            "kind": "number",
            "unit": null,
          },
        ],
        "delegatesIndexTo": "Table1",
        "indexName": "JoinResult",
        "kind": "table",
      }
    `);

    expect(joinResult.value).toHaveLength(6);
    expect(joinResult.value).toMatchInlineSnapshot(`
      [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
        ],
        [
          true,
          false,
          true,
        ],
        [
          true,
          false,
          true,
        ],
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
        ],
        [
          true,
          false,
          true,
        ],
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
        ],
      ]
    `);
  });
});
