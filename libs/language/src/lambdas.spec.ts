import { expect, describe, it } from 'vitest';
import type { AST } from '@decipad/language-interfaces';
import { inferStatement } from './infer';
import { evaluateStatement } from './interpreter';
import { N } from '@decipad/number';
import { ScopedRealm, makeInferContext } from './scopedRealm';

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
      new ScopedRealm(undefined, makeInferContext()),
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
      new ScopedRealm(undefined, makeInferContext()),
      anonymousFunction
    );

    expect(value).toMatchInlineSnapshot(`
      FunctionValue {
        "argumentNames": [
          "a",
          "b",
        ],
        "body": {
          "args": [
            {
              "args": [
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
