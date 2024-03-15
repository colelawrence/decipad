// eslint-disable-next-line no-restricted-imports
import { AST } from '@decipad/language-types';
import { inferStatement, makeContext } from './infer';
import { Realm, evaluateStatement } from './interpreter';
import { N } from '@decipad/number';

describe('lambdas', () => {
  const anonymousFunction: AST.FunctionDefinition = {
    type: 'function-definition',
    args: [
      {
        type: 'funcdef',
        args: ['functionName'],
      },
      {
        type: 'argument-names',
        args: [
          { type: 'def', args: ['a'] },
          { type: 'def', args: ['b'] },
        ],
      },
      {
        type: 'block',
        id: 'block-id',
        args: [{ type: 'literal', args: ['number', N(1)] }],
      },
    ],
  };

  it('infers the type of a lambda', async () => {
    const type = await inferStatement(
      new Realm(makeContext()),
      anonymousFunction
    );
    expect(type).toMatchObject({
      errorCause: null,
      functionArgNames: ['a', 'b'],
      functionName: 'functionName',
      functionScopeDepth: 0,
      functionness: true,
    });
  });

  it('evaluates a lambda', async () => {
    const value = await evaluateStatement(
      new Realm(makeContext()),
      anonymousFunction
    );

    expect(value).toMatchInlineSnapshot(`
      FunctionValue {
        "argumentNames": Array [
          "a",
          "b",
        ],
        "body": Object {
          "args": Array [
            Object {
              "args": Array [
                "number",
                DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              ],
              "type": "literal",
            },
          ],
          "id": "block-id",
          "type": "block",
        },
      }
    `);
  });
});
