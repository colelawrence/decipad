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

// Gets a single value from an expanded AST.

// exhaustive switch
// eslint-disable-next-line consistent-return
export async function evaluate(
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
      const value = realm.stack.get(identifier);
      if (value != null) {
        return value;
      }

      const type = realm.getTypeAt(node);
      const unit = getDefined(
        type.unit,
        `no unit for ${identifier}, which probably means that ${identifier} is not a number`
      );
      return Scalar.fromValue(multiplyMultipliers(unit));
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
        funcArgs.map((arg) => () => evaluate(realm, arg))
      );

      if (funcName === 'previous') {
        return realm.previousValue ?? args[0];
      } else if (realm.functions.has(funcName)) {
        const customFunc = getDefined(realm.functions.get(funcName));

        return realm.stack.withPushCall(async () => {
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
            realm.inferContext.nodeTypes.get(arg),
            () => `Could not get type for node ${prettyPrintAST(arg)}`
          )
        );
        const returnType = getDefined(realm.inferContext.nodeTypes.get(node));
        return callBuiltin(realm, funcName, args, argTypes, returnType);
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

      if (start instanceof DateValue && end instanceof DateValue) {
        const startUnit = dateNodeToTimeUnit(
          getOfType('date', node.args[0]).args
        );
        const endUnit = dateNodeToTimeUnit(
          getOfType('date', node.args[1]).args
        );

        const step = getDateSequenceIncrement(node.args[2], startUnit, endUnit);
        return columnFromDateSequence(start, end, step);
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
        node.args[0].args.map((v) => () => evaluate(realm, v))
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

export async function evaluateStatement(
  realm: Realm,
  statement: AST.Statement
) {
  const value = await evaluate(realm, statement);
  return value;
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
