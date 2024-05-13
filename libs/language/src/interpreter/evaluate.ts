/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-restricted-imports
import { callBuiltin, getConstantByName } from '@decipad/language-builtins';
// eslint-disable-next-line no-restricted-imports
import type { AST } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  Unit,
  Value,
  isErrorType,
  resultToValue,
} from '@decipad/language-types';
import { getDefined } from '@decipad/utils';
import type { TRealm, TScopedRealm } from '..';
import { prettyPrintAST } from '..';
import { getIdentifierString } from '../utils';
import { getDateFromAstForm } from '../date';
import { expandDirectiveToValue } from '../directives';
import { columnFromDateSequence, columnFromSequence } from '../value';
import { evaluateTable, getProperty } from '../tables/evaluate';
import { getDateSequenceIncrement } from '../infer/sequence';
import { evaluateMatrixRef, evaluateMatrixAssign } from '../matrix';
import { evaluateCategories } from '../categories';
import { evaluateColumnAssign } from '../tables/column-assign';
import { evaluateMatch } from '../match/evaluateMatch';
import { evaluateTiered } from '../tiered/evaluateTiered';
import { getDependencies } from '../dependencies/getDependencies';
import { CURRENT_COLUMN_SYMBOL, usingPrevious } from './previous';
import { isPrevious } from '../utils/isPrevious';
import { getOfType } from '../parser/getOfType';
import { scopedToDepthAndWithPush } from '../scopedRealm/ScopedRealm';

// Gets a single value from an expanded AST.

// exhaustive switch
// eslint-disable-next-line consistent-return, complexity
async function internalEvaluate(
  realm: TRealm,
  node: AST.Statement
): Promise<Value.Value> {
  switch (node.type) {
    case 'noop': {
      return Value.UnknownValue;
    }
    case 'literal': {
      switch (node.args[0]) {
        case 'number': {
          const type = realm.maybeGetTypeAt(node);
          if (type && type.unit) {
            return Value.Scalar.fromValue(
              Unit.multiplyMultipliers(type.unit, node.args[1])
            );
          }
          return Value.Scalar.fromValue(node.args[1]);
        }
        case 'string':
        case 'boolean': {
          return Value.Scalar.fromValue(node.args[1]);
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
      realm.stack.set(varName, value, realm.statementId);
      return value;
    }
    case 'ref': {
      const identifier = getIdentifierString(node);
      const c = getConstantByName(identifier);
      if (c) {
        return c.value;
      }
      const type = realm.getTypeAt(node);
      const value = realm.stack.get(identifier);
      if (value != null) {
        return Value.sortValue(type, value)[1];
      }

      return Value.Scalar.fromValue(Unit.multiplyMultipliers(type.unit ?? []));
    }
    case 'externalref': {
      const data = realm.externalData.get(node.args[0]);
      if (data) {
        return resultToValue(data);
      }
      return Value.UnknownValue;
    }
    case 'function-call': {
      const funcName = getIdentifierString(node.args[0]);
      const funcArgs = getOfType('argument-list', node.args[1]).args;

      if (isPrevious(funcName)) {
        const defaultValue = await evaluate(realm, funcArgs[0]);
        if (realm.previousRow == null) {
          return defaultValue;
        }

        if (funcArgs.length < 2) {
          return realm.previousRow.get(CURRENT_COLUMN_SYMBOL) ?? defaultValue;
        }
        const previousExpression: AST.Expression = funcArgs[1];

        return usingPrevious(realm, previousExpression, evaluate);
      } else if (realm.inferContext.stack.has(funcName)) {
        const args = await Promise.all(
          funcArgs.map(async (arg) => evaluate(realm, arg))
        );
        const functionType = getDefined(realm.inferContext.stack.get(funcName));
        const customFunc = getOfType(
          'function-definition',
          getDefined(
            functionType?.node,
            `could not find function definition node for function "${funcName}"`
          )
        );
        return scopedToDepthAndWithPush(
          realm,
          functionType.functionScopeDepth ?? 0,
          `function call ${funcName}`,
          async (newRealm) => {
            for (let i = 0; i < args.length; i++) {
              const argName = getIdentifierString(customFunc.args[1].args[i]);

              newRealm.stack.set(argName, args[i]);
            }

            const funcBody: AST.Block = customFunc.args[2];

            for (let i = 0; i < funcBody.args.length; i++) {
              // eslint-disable-next-line no-await-in-loop
              const value = await evaluate(newRealm, funcBody.args[i]);

              if (i === funcBody.args.length - 1) {
                return value;
              }
            }

            throw new Error('function is empty');
          }
        );
      } else {
        const args = await Promise.all(
          funcArgs.map(async (arg) => evaluate(realm, arg))
        );
        const argTypes = funcArgs.map((arg) =>
          getDefined(
            arg.inferredType,
            () => `Could not get type for node ${prettyPrintAST(arg)}`
          )
        );
        const returnType = getDefined(node.inferredType);
        if (isErrorType(returnType)) {
          return Value.UnknownValue;
        }
        return callBuiltin(
          realm.utils,
          funcName,
          args,
          argTypes,
          returnType,
          funcArgs
        );
      }
    }
    case 'range': {
      const [start, end] = await Promise.all(
        node.args.map(async (arg) => evaluate(realm, getDefined(arg)))
      );

      return Value.Range.fromBounds(start, end);
    }
    case 'sequence': {
      const start = await evaluate(realm, getDefined(node.args[0]));
      const end = await evaluate(realm, getDefined(node.args[1]));

      if (start instanceof Value.DateValue && end instanceof Value.DateValue) {
        const startUnit = realm.getTypeAt(node.args[0]);
        if (!startUnit.date) {
          throw new Error(
            'Unexpected type of start unit. It should have been a date'
          );
        }
        const endUnit = realm.getTypeAt(node.args[1]);
        if (!endUnit.date) {
          throw new Error(
            'Unexpected type of start unit. It should have been a date'
          );
        }

        const step = getDateSequenceIncrement(
          node.args[2],
          startUnit.date,
          endUnit.date
        );
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
      return Value.DateValue.fromDateAndSpecificity(dateMs, specificity);
    }
    case 'column': {
      const values: Value.Value[] = await Promise.all(
        node.args[0].args.map(async (v) => evaluate(realm, v))
      );

      return Value.Column.fromValues(
        values,
        Value.defaultValue(getDefined(node.inferredType))
      );
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
      const value = Value.FunctionValue.from(
        getDefined(getDefined(node.inferredType).functionArgNames),
        node.args[2]
      );
      if (funcName) {
        realm.stack.set(funcName, value, realm.statementId);
      }
      return value;
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

const loggedError = Symbol('loggedError');
type ErrorWithLoggedError = Error & { [loggedError]?: boolean };

const shouldOutputDebugInfo =
  !!process.env.DEBUG ||
  (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID);

export async function evaluate(
  realm: TRealm,
  node: AST.Statement
): Promise<Value.Value> {
  const cachedValue = node.cacheKey
    ? realm.expressionCache.getCacheResult(node.cacheKey)
    : undefined;
  if (cachedValue != null) {
    return cachedValue;
  }

  try {
    const value = await internalEvaluate(realm, node);
    if (node.cacheKey) {
      const dependencies = getDependencies(node);
      realm.expressionCache.putCacheResult(node.cacheKey, dependencies, value);
    }
    return value;
  } catch (err) {
    if (!(err as ErrorWithLoggedError)[loggedError]) {
      if (shouldOutputDebugInfo) {
        let info = `Error evaluating \`${prettyPrintAST(node)}\`: ${
          (err as Error).message
        }`;
        let _realm: TScopedRealm | undefined = realm;
        while (_realm) {
          info += `\n  ${_realm.depth}: in realm "${_realm.name}"`;
          info += `\n    ${realm.toString()}`;
          _realm = _realm.parent;
        }

        console.warn(info);
        console.error(err);
      }

      (err as ErrorWithLoggedError)[loggedError] = true;
    }
    throw err;
  }
}

export const evaluateStatement = evaluate;

export async function evaluateBlock(
  realm: TRealm,
  block: AST.Block
): Promise<Value.Value> {
  let previous;
  for (const statement of block.args) {
    // eslint-disable-next-line no-await-in-loop
    previous = await evaluateStatement(realm, statement);
  }

  return getDefined(previous, 'panic: Unexpected empty block');
}
