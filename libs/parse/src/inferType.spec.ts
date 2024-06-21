// ============================================================
//  TYPE INFERRING SPECIFICATION
//
//  When we do the migration of common files like these over
//  to WASM, we need a reference point to make sure to not
//  introduce any breaking changes.
//
//  Every test in here is based on the `inferType` function
//  as it is the entry point for any inferrence needed.
//
//  This spec file will also highlight a few cases where our
//  current parsing fails.
// ============================================================

import { RemoteComputer } from '@decipad/remote-computer';
import { inferType } from './inferType';
import { inferTable } from './inferTable';
//
// This file will act as a specification for specific decisions to do with parsing.
//

let computer = new RemoteComputer();
beforeEach(() => {
  computer = new RemoteComputer();
});

describe('Inferring numbers without units', () => {
  it('infers simple number', async () => {
    await expect(inferType(computer, '5')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "5",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
    await expect(inferType(computer, '100')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "100",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
    await expect(inferType(computer, '-23')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "-23",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
    await expect(inferType(computer, '1.2')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "1.2",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
    await expect(inferType(computer, '-0.32')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "-0.32",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
  });

  it('fails to parse some edge cases', async () => {
    await expect(inferType(computer, '.23')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": ".23",
        "type": Object {
          "kind": "string",
        },
      }
    `);
    await expect(inferType(computer, '-.23')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "-.23",
        "type": Object {
          "kind": "string",
        },
      }
    `);
  });

  it('fails to parse big numbers without option', async () => {
    //
    // This is due to the lexer.
    // We have some very strange look aheads in our lexers Regex's.
    //
    // Which causes very large regex expressions for big numbers.
    // This will need to be investigated because it can easily crash the app.
    //

    await expect(
      inferType(computer, '999999999999999999999999999999999999999999999', {
        doNotTryExpressionNumbersParse: true,
      })
    ).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "999999999999999999999999999999999999999999999",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
    await expect(
      inferType(computer, '-99999999999999999999999999999999999999999999', {
        doNotTryExpressionNumbersParse: true,
      })
    ).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "-99999999999999999999999999999999999999999999",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
  });
});

describe('Inferring numbers with units', () => {
  it('infers simple numbers with simple units', async () => {
    await expect(inferType(computer, '10$')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "10$",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
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
      }
    `);
    await expect(inferType(computer, '$10')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "$10",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
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
      }
    `);

    await expect(inferType(computer, '5.2 kilograms')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "5.2 kilograms",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
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
                "n": 1000n,
                "s": 1n,
              },
              "unit": "grams",
            },
          ],
        },
      }
    `);
    await expect(inferType(computer, '330 grams')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "330 grams",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "baseQuantity": "mass",
              "baseSuperQuantity": "mass",
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
              "unit": "grams",
            },
          ],
        },
      }
    `);

    await expect(inferType(computer, '100 oranges')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "100 oranges",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "oranges",
            },
          ],
        },
      }
    `);
    await expect(inferType(computer, '0.5555 bananas')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "0.5555 bananas",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "bananas",
            },
          ],
        },
      }
    `);

    await expect(inferType(computer, '€320.23')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "€320.23",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "baseQuantity": "EUR",
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
              "unit": "€",
            },
          ],
        },
      }
    `);
    await expect(inferType(computer, '32221€')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "32221€",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "baseQuantity": "EUR",
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
              "unit": "€",
            },
          ],
        },
      }
    `);
  });

  // We cannot run this test, it takes forever to finish (maybe literally).
  //
  // The reason we can't do this one, is because we cant pass the option.
  // `doNotTryExpressionNumbersParse`, which skips the attempt at parsing.
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('fails to parse large number with unit in time', async () => {
    await expect(
      inferType(computer, '6022520000000000000000000000000000000000 atoms')
    ).resolves.toMatchInlineSnapshot();
  });

  it('parses numbers with more complex units', async () => {
    await expect(inferType(computer, '32 $ per customer')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "32 $ per customer",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
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
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": -1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "customers",
            },
          ],
        },
      }
    `);
    await expect(inferType(computer, '5 staff per child')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "5 staff per child",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": -1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "children",
            },
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "staff",
            },
          ],
        },
      }
    `);
    await expect(inferType(computer, '12$ per month per developer')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "12$ per month per developer",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
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
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": -1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "developers",
            },
            Object {
              "baseQuantity": "month",
              "baseSuperQuantity": "month",
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": -1n,
              },
              "known": true,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "months",
            },
          ],
        },
      }
    `);

    await expect(inferType(computer, '32 $ / customer')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "32 $ / customer",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
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
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": -1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "customers",
            },
          ],
        },
      }
    `);
    await expect(inferType(computer, '5 staff / child')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "5 staff / child",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": -1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "children",
            },
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "staff",
            },
          ],
        },
      }
    `);
    await expect(inferType(computer, '12$ / month / developer')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "12$ / month / developer",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
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
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": -1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "developers",
            },
            Object {
              "baseQuantity": "month",
              "baseSuperQuantity": "month",
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": -1n,
              },
              "known": true,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "months",
            },
          ],
        },
      }
    `);

    await expect(inferType(computer, '55 kilograms / kilograms')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "55 kilograms / kilograms",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
  });
});

describe('Infers dates', () => {
  //
  // In a recent PR, I turned off automatic date detection.
  // This is because it is the bottleneck when it comes to parsing.
  //
  // We have many formats to try from and they take forever to get through.
  // Slowing the whole importing process down.
  //
  // If we can add this functionality with WASM, then great!
  //

  //
  // Many of these are parsed as numbers, which they shouldnt be really.
  // However, I will leave these for now, because the point of this PR
  // isn't about fixing, but about getting our current behavior mapped out.
  //

  it('does not parse dates', async () => {
    await expect(inferType(computer, '1716985282')).resolves.toMatchObject({
      coerced: '1716985282',
      type: {
        kind: 'number',
        unit: null,
      },
    });

    await expect(inferType(computer, '06-06-2024')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "06-06-2024",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
    await expect(inferType(computer, '06/06/2024')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "06/06/2024",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
    await expect(inferType(computer, '2024/06/06')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "2024/06/06",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
    await expect(inferType(computer, '2024-06-06')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "2024-06-06",
        "type": Object {
          "kind": "number",
          "unit": null,
        },
      }
    `);
  });
});

describe('Infers strings', () => {
  it('Infers simple strings', async () => {
    await expect(inferType(computer, 'hello')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "hello",
        "type": Object {
          "kind": "string",
        },
      }
    `);
    await expect(inferType(computer, 'world')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "world",
        "type": Object {
          "kind": "string",
        },
      }
    `);
    await expect(inferType(computer, 'something!')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "something!",
        "type": Object {
          "kind": "string",
        },
      }
    `);
    await expect(inferType(computer, 'dnsjdjnksakdsjna')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "dnsjdjnksakdsjna",
        "type": Object {
          "kind": "string",
        },
      }
    `);
  });

  it('Infers more complex strings', async () => {
    await expect(inferType(computer, 'hello world')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "hello world",
        "type": Object {
          "kind": "string",
        },
      }
    `);

    await expect(
      inferType(
        computer,
        'Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.'
      )
    ).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.",
        "type": Object {
          "kind": "string",
        },
      }
    `);

    await expect(inferType(computer, 'one world')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "one world",
        "type": Object {
          "kind": "string",
        },
      }
    `);
  });

  it('Doesnt parse edge cases as strings', async () => {
    //
    // Some of these aren't correct
    //

    await expect(inferType(computer, 'something 5')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "something 5",
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "somethings",
            },
          ],
        },
      }
    `);
  });
});

describe('Infers booleans', () => {
  it('Infers simple booleans', async () => {
    await expect(inferType(computer, 'true')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "true",
        "type": Object {
          "kind": "boolean",
        },
      }
    `);

    await expect(inferType(computer, 'false')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "false",
        "type": Object {
          "kind": "boolean",
        },
      }
    `);

    await expect(inferType(computer, 'True')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "true",
        "type": Object {
          "kind": "boolean",
        },
      }
    `);
    await expect(inferType(computer, 'False')).resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "false",
        "type": Object {
          "kind": "boolean",
        },
      }
    `);
  });
});

describe('Infers columns', () => {
  it('Infers simple columns without units', async () => {
    await expect(inferType(computer, '[1, 2, 3]')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "[1, 2, 3]",
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": null,
          "kind": "column",
        },
      }
    `);
    await expect(inferType(computer, "['hello', 'world', 'something']"))
      .resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "['hello', 'world', 'something']",
        "type": Object {
          "cellType": Object {
            "kind": "string",
          },
          "indexedBy": null,
          "kind": "column",
        },
      }
    `);
    await expect(inferType(computer, '[true, false, false]')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "[true, false, false]",
        "type": Object {
          "cellType": Object {
            "kind": "boolean",
          },
          "indexedBy": null,
          "kind": "column",
        },
      }
    `);
  });

  it('Infers number columns with units', async () => {
    await expect(inferType(computer, '[10$, 20$, 30$]')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "[10$, 20$, 30$]",
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": Array [
              Object {
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
          "indexedBy": null,
          "kind": "column",
        },
      }
    `);
  });

  it('Fails to infer columns with number units', async () => {
    await expect(inferType(computer, '[10, 20, 30$]')).resolves
      .toMatchInlineSnapshot(`
      Object {
        "coerced": "[10, 20, 30$]",
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": null,
          "kind": "column",
        },
      }
    `);
    await expect(inferType(computer, '[4 grams, 20 kilograms, 2 cups]'))
      .resolves.toMatchInlineSnapshot(`
      Object {
        "coerced": "[4 grams, 20 kilograms, 2 cups]",
        "type": Object {
          "errorCause": Object {
            "errType": "expected-unit",
            "expectedUnit": Array [
              Array [
                Object {
                  "baseQuantity": "mass",
                  "baseSuperQuantity": "mass",
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
                  "unit": "grams",
                },
              ],
              Array [
                Object {
                  "baseQuantity": "volume",
                  "baseSuperQuantity": "volume",
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
                  "unit": "cups",
                },
              ],
            ],
          },
          "errorLocation": Object {
            "end": Object {
              "char": 29,
              "column": 30,
              "line": 1,
            },
            "start": Object {
              "char": 24,
              "column": 25,
              "line": 1,
            },
          },
          "kind": "type-error",
        },
      }
    `);
  });
});

//
// Infers tables uses a different function to `inferType`
//

describe('Infers tables', () => {
  it('infers simple tables', async () => {
    await expect(
      inferTable(
        computer,
        {
          values: [
            [1, 2, 3],
            [5, 6, 7],
          ],
        },
        {}
      )
    ).resolves.toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "columnNames": Array [
            "A",
            "B",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "indexName": "A",
          "kind": "table",
        },
        "value": Array [
          [Function],
          [Function],
        ],
      }
    `);
  });

  it('Fails to parse columns with booleans', async () => {
    await expect(
      inferTable(
        computer,
        {
          values: [
            [true, false, true],
            ['a', 'b', 'c'],
          ],
        },
        {}
      )
    ).resolves.toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "columnNames": Array [
            "A",
            "B",
          ],
          "columnTypes": Array [
            Object {
              "kind": "string",
            },
            Object {
              "kind": "string",
            },
          ],
          "indexName": "A",
          "kind": "table",
        },
        "value": Array [
          [Function],
          [Function],
        ],
      }
    `);
  });

  it('infers tables with units', async () => {
    await expect(
      inferTable(
        computer,
        {
          values: [
            ['3$', '4$', '5$'],
            ['10', '$32', '99'],
          ],
        },
        {}
      )
    ).resolves.toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "columnNames": Array [
            "A",
            "B",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": Array [
                Object {
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
            Object {
              "kind": "number",
              "unit": Array [
                Object {
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
          "indexName": "A",
          "kind": "table",
        },
        "value": Array [
          [Function],
          [Function],
        ],
      }
    `);
  });
});
