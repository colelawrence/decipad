import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { AST } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { Value, InferError } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { callBuiltin } from '@decipad/language-builtins';
import { getIdentifierString } from '../utils';
import { getOfType } from '../parser/getOfType';
import type { TRealm } from '../scopedRealm';

// Gets a single value from a simple expression (literals and
// zero-dimension builtin functions only) expanded AST.

// eslint-disable-next-line consistent-return
export async function simpleExpressionEvaluate(
  realm: TRealm,
  node: AST.Statement
): Promise<Value.NumberValue> {
  switch (node.type) {
    case 'literal': {
      switch (node.args[0]) {
        case 'number': {
          return Value.NumberValue.fromValue(node.args[1]);
        }
        default: {
          throw InferError.expectedButGot('number', node.args[0]);
        }
      }
    }
    case 'function-call': {
      const funcName = getIdentifierString(node.args[0]);
      const funcArgs = getOfType('argument-list', node.args[1]).args;
      const args = await Promise.all(
        funcArgs.map(async (arg) => simpleExpressionEvaluate(realm, arg))
      );
      const argTypes = funcArgs.map((arg) =>
        getDefined(arg.inferredType, 'exponent type should be defined')
      );
      const returnType = getDefined(node.inferredType);
      const res = await callBuiltin(
        realm.utils,
        funcName,
        args,
        argTypes,
        returnType
      );
      if (!(res instanceof Value.NumberValue)) {
        throw InferError.complexExpressionExponent();
      }
      return res;
    }
    default: {
      throw InferError.complexExpressionExponent();
    }
  }
}
