import pSeries from 'p-series';
import { AST } from '..';
import { callBuiltin } from '../builtins';
import { getOfType, getDefined, getIdentifierString } from '../utils';
import { dateNodeToTimeUnit, getDateFromAstForm } from '../date';
import { resolve as resolveData } from '../data';
import { expandDirectiveToValue } from '../directives';

import { Realm } from './Realm';
import { Scalar, Range, Date, Column, Value, UnknownValue } from './Value';
import { evaluateTable, getProperty } from './table';
import { evaluateData } from './data';
import { getDateSequenceIncrement } from '../infer/sequence';

// Gets a single value from an expanded AST.

// exhaustive switch
// eslint-disable-next-line consistent-return
export async function evaluate(
  realm: Realm,
  node: AST.Statement | AST.Expression
): Promise<Value> {
  switch (node.type) {
    case 'literal': {
      switch (node.args[0]) {
        case 'number':
        case 'string':
        case 'boolean': {
          return Scalar.fromValue(node.args[1]);
        }
        default: {
          throw new Error(
            `not implemented: literals with type ${node.args[0]}`
          );
        }
      }
    }
    case 'assign': {
      const varName = getIdentifierString(node.args[0]);
      const value = await evaluate(realm, node.args[1]);
      realm.stack.set(varName, value);
      return value;
    }
    case 'ref': {
      const identifier = getIdentifierString(node);
      const value = realm.stack.get(identifier);
      if (value != null) {
        return value;
      }
      return Scalar.fromValue(1);
    }
    case 'externalref': {
      const { value } = getDefined(realm.externalData.get(node.args[0]));
      return value;
    }
    case 'function-call': {
      const funcName = getIdentifierString(node.args[0]);
      const funcArgs = getOfType('argument-list', node.args[1]).args;
      const args = await pSeries(
        funcArgs.map((arg) => () => evaluate(realm, arg))
      );

      if (funcName === 'previous') {
        return realm.previousValue ?? args[0];
      } else if (realm.functions.has(funcName)) {
        const customFunc = getDefined(realm.functions.get(funcName));

        return realm.stack.withPush(async () => {
          for (let i = 0; i < args.length; i++) {
            const argName = getIdentifierString(customFunc.args[1].args[i]);

            realm.stack.set(argName, args[i]);
          }

          const funcBody: AST.Block = customFunc.args[2];

          for (let i = 0; i < funcBody.args.length; i++) {
            // TODO should this be parallel?
            // eslint-disable-next-line no-await-in-loop
            const value = await evaluate(realm, funcBody.args[i]);

            if (i === funcBody.args.length - 1) {
              return value;
            }
          }

          throw new Error('function is empty');
        });
      } else {
        const argTypes = funcArgs.map((arg) =>
          getDefined(realm.inferContext.nodeTypes.get(arg))
        );
        const returnType = getDefined(realm.inferContext.nodeTypes.get(node));
        return callBuiltin(funcName, args, argTypes, returnType);
      }
    }
    case 'range': {
      const [start, end] = await pSeries(
        node.args.map((arg) => () => evaluate(realm, getDefined(arg)))
      );

      return Range.fromBounds(start, end);
    }
    case 'sequence': {
      const start = await evaluate(realm, getDefined(node.args[0]));
      const end = await evaluate(realm, getDefined(node.args[1]));

      if (start instanceof Date && end instanceof Date) {
        const startUnit = dateNodeToTimeUnit(
          getOfType('date', node.args[0]).args
        );
        const endUnit = dateNodeToTimeUnit(
          getOfType('date', node.args[1]).args
        );

        return Column.fromDateSequence(
          start,
          end,
          getDateSequenceIncrement(node.args[2], startUnit, endUnit)
        );
      } else {
        return Column.fromSequence(
          start,
          end,
          node.args[2] ? await evaluate(realm, node.args[2]) : undefined
        );
      }
    }
    case 'date': {
      const [dateMs, specificity] = getDateFromAstForm(node.args);
      return Date.fromDateAndSpecificity(dateMs, specificity);
    }
    case 'column': {
      const values: Value[] = await pSeries(
        node.args[0].args.map((v) => () => evaluate(realm, v))
      );

      return Column.fromValues(values);
    }
    case 'table': {
      return evaluateTable(realm, node);
    }
    case 'property-access': {
      const tableOrRow = await evaluate(realm, node.args[0]);
      return getProperty(tableOrRow, node.args[1]);
    }
    case 'function-definition': {
      const funcName = getIdentifierString(getDefined(node.args[0]));
      realm.functions.set(funcName, node);

      // Typecheck ensures this isn't used as a result
      // but we want to always return something
      return UnknownValue;
    }
    case 'imported-data': {
      const [url, contentType] = node.args;
      return evaluateData(
        realm,
        await resolveData({ url, contentType, fetch: realm.inferContext.fetch })
      );
    }
    case 'directive': {
      const [name, ...args] = node.args;
      return expandDirectiveToValue(realm, name, args);
    }
  }
}
