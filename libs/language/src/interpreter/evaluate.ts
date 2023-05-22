import pSeries from 'p-series';
import { AST, prettyPrintAST } from '..';
import { callBuiltin, getConstantByName } from '../builtins';
import {
  getOfType,
  getDefined,
  getIdentifierString,
  multiplyMultipliers,
} from '../utils';
import { dateNodeToTimeUnit, getDateFromAstForm } from '../date';
import { expandDirectiveToValue } from '../directives';

import { Realm } from './Realm';
import {
  Scalar,
  Range,
  DateValue,
  Column,
  Value,
  UnknownValue,
  columnFromDateSequence,
  columnFromSequence,
} from '../value';
import { evaluateTable, getProperty } from '../tables/evaluate';
import { getDateSequenceIncrement } from '../infer/sequence';
import { isPreviousRef } from '../previous-ref';
import { evaluateMatrixRef, evaluateMatrixAssign } from '../matrix';
import { evaluateCategories } from '../categories';
import { evaluateColumnAssign } from '../tables/column-assign';
import { evaluateMatch } from '../match/evaluateMatch';
import { evaluateTiered } from '../tiered/evaluateTiered';
import { RuntimeError } from '.';
import { resultToValue } from '../result';
import { getDependencies } from '../dependencies/getDependencies';
import { CURRENT_COLUMN_SYMBOL } from './previous';
import { sortValue } from './sortValue';

// Gets a single value from an expanded AST.

// exhaustive switch
// eslint-disable-next-line consistent-return
async function internalEvaluate(
  realm: Realm,
  node: AST.Statement
): Promise<Value> {
  switch (node.type) {
    case 'noop': {
      return UnknownValue;
    }
    case 'literal': {
      switch (node.args[0]) {
        case 'number': {
          const type = realm.maybeGetTypeAt(node);
          if (type && type.unit) {
            return Scalar.fromValue(
              multiplyMultipliers(type.unit, node.args[1])
            );
          }
          return Scalar.fromValue(node.args[1]);
        }
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
      realm.stack.set(varName, value, 'function', realm.statementId);
      return value;
    }
    case 'ref': {
      const identifier = getIdentifierString(node);
      if (isPreviousRef(identifier)) {
        if (realm.previousStatementValue == null) {
          throw new RuntimeError('No previous value');
        }
        return realm.previousStatementValue;
      }
      const c = getConstantByName(identifier);
      if (c) {
        return c.value;
      }
      const type = realm.getTypeAt(node);
      const value = realm.stack.get(identifier);
      if (value != null) {
        return sortValue(type, value)[1];
      }

      return Scalar.fromValue(multiplyMultipliers(type.unit ?? []));
    }
    case 'externalref': {
      const data = realm.externalData.get(node.args[0]);
      if (data) {
        return resultToValue(data);
      }
      return UnknownValue;
    }
    case 'function-call': {
      const funcName = getIdentifierString(node.args[0]);
      const funcArgs = getOfType('argument-list', node.args[1]).args;
      const args = await pSeries(
        funcArgs.map((arg) => async () => evaluate(realm, arg))
      );

      if (funcName === 'previous') {
        if (realm.previousRow === null) {
          return args[0];
        }

        if (funcArgs[1] && funcArgs[1].type !== 'ref') {
          throw new Error(
            "Second argument to 'previous' must be a column name."
          );
        }

        const columnName = funcArgs[1]?.args[0] || CURRENT_COLUMN_SYMBOL;
        const previousValue = realm.previousRow.get(columnName);
        if (previousValue) {
          return previousValue;
        } else {
          throw new Error('Column name does not exist.');
        }
      } else if (realm.functions.has(funcName)) {
        const customFunc = getDefined(realm.functions.get(funcName));

        return realm.withPushCall(async () => {
          for (let i = 0; i < args.length; i++) {
            const argName = getIdentifierString(customFunc.args[1].args[i]);

            realm.stack.set(argName, args[i]);
          }

          const funcBody: AST.Block = customFunc.args[2];

          for (let i = 0; i < funcBody.args.length; i++) {
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
          getDefined(
            arg.inferredType,
            () => `Could not get type for node ${prettyPrintAST(arg)}`
          )
        );
        const returnType = getDefined(node.inferredType);
        return callBuiltin(realm, funcName, args, argTypes, returnType);
      }
    }
    case 'range': {
      const [start, end] = await pSeries(
        node.args.map((arg) => async () => evaluate(realm, getDefined(arg)))
      );

      return Range.fromBounds(start, end);
    }
    case 'sequence': {
      const start = await evaluate(realm, getDefined(node.args[0]));
      const end = await evaluate(realm, getDefined(node.args[1]));

      if (start instanceof DateValue && end instanceof DateValue) {
        const startUnit = dateNodeToTimeUnit(
          getOfType('date', node.args[0]).args
        );
        const endUnit = dateNodeToTimeUnit(
          getOfType('date', node.args[1]).args
        );

        const step = getDateSequenceIncrement(node.args[2], startUnit, endUnit);
        return getDefined(await columnFromDateSequence(start, end, step));
      } else {
        const step = node.args[2]
          ? await evaluate(realm, node.args[2])
          : undefined;
        return columnFromSequence(start, end, step);
      }
    }
    case 'date': {
      const [dateMs, specificity] = getDateFromAstForm(node.args);
      return DateValue.fromDateAndSpecificity(dateMs, specificity);
    }
    case 'column': {
      const values: Value[] = await pSeries(
        node.args[0].args.map((v) => async () => evaluate(realm, v))
      );

      return Column.fromValues(values);
    }
    case 'table': {
      return evaluateTable(realm, node);
    }
    case 'property-access': {
      const [base, prop] = node.args;
      const tableOrRow = await evaluate(realm, base);
      return getProperty(tableOrRow, getIdentifierString(prop));
    }
    case 'table-column-assign': {
      return evaluateColumnAssign(realm, node);
    }
    case 'matrix-assign': {
      return evaluateMatrixAssign(realm, node);
    }
    case 'matrix-ref': {
      return evaluateMatrixRef(realm, node);
    }
    case 'categories': {
      return evaluateCategories(realm, node);
    }
    case 'function-definition': {
      const funcName = getIdentifierString(getDefined(node.args[0]));
      realm.functions.set(funcName, node);

      // Typecheck ensures this isn't used as a result
      // but we want to always return something
      return UnknownValue;
    }
    case 'directive': {
      return expandDirectiveToValue(realm, node);
    }
    case 'match': {
      return evaluateMatch(realm, node);
    }
    case 'tiered': {
      return evaluateTiered(realm, node);
    }
  }
}

export async function evaluate(
  realm: Realm,
  node: AST.Statement
): Promise<Value> {
  const cachedValue = node.cacheKey
    ? realm.expressionCache.getCacheResult(node.cacheKey)
    : undefined;
  if (cachedValue != null) {
    return cachedValue;
  }

  const value = await internalEvaluate(realm, node);
  if (node.cacheKey) {
    const dependencies = getDependencies(node);
    realm.expressionCache.putCacheResult(node.cacheKey, dependencies, value);
  }
  return value;
}

export async function evaluateStatement(
  realm: Realm,
  statement: AST.Statement
) {
  return evaluate(realm, statement);
}

export async function evaluateBlock(
  realm: Realm,
  block: AST.Block
): Promise<Value> {
  let previous;
  for (const statement of block.args) {
    // eslint-disable-next-line no-await-in-loop
    previous = await evaluateStatement(realm, statement);
  }

  return getDefined(previous, 'panic: Unexpected empty block');
}
