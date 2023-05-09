import { AST } from '..';
import { callBuiltin } from '../builtins';
import { getOfType, getDefined, getIdentifierString } from '../utils';

import { Realm } from './Realm';
import { NumberValue } from '../value';

import { InferError } from '../type';

// Gets a single value from a simple expression (literals and
// zero-dimension builtin functions only) expanded AST.

// eslint-disable-next-line consistent-return
export async function simpleExpressionEvaluate(
  realm: Realm,
  node: AST.Statement
): Promise<NumberValue> {
  switch (node.type) {
    case 'literal': {
      switch (node.args[0]) {
        case 'number': {
          return NumberValue.fromValue(node.args[1]);
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
        getDefined(
          realm.inferContext.nodeTypes.get(arg),
          'exponent type should be defined'
        )
      );
      const returnType = getDefined(realm.inferContext.nodeTypes.get(node));
      const res = await callBuiltin(
        realm,
        funcName,
        args,
        argTypes,
        returnType
      );
      if (!(res instanceof NumberValue)) {
        throw InferError.complexExpressionExponent();
      }
      return res;
    }
    default: {
      throw InferError.complexExpressionExponent();
    }
  }
}
