import pSeries from 'p-series';

import { AST } from '..';
import { callBuiltin } from '../builtins';
import { getOfType, getDefined, getIdentifierString } from '../utils';
import { getDateFromAstForm, getTimeUnit } from '../date';

import { Realm } from './Realm';
import {
  Scalar,
  Range,
  Date,
  Column,
  SimpleValue,
  TimeQuantity,
  Value,
} from './Value';
import { evaluateTable } from './table';
import { evaluateGiven } from './given';
import { evaluateData } from './data';
import { resolve as resolveData } from '../data';

// Gets a single value from an expanded AST.

// exhaustive switch
// eslint-disable-next-line consistent-return
export async function evaluate(
  realm: Realm,
  node: AST.Statement
): Promise<SimpleValue> {
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
    case 'time-quantity': {
      return TimeQuantity.fromASTArgs(node.args);
    }
    case 'assign': {
      const varName = getIdentifierString(node.args[0]);
      const value = await evaluate(realm, node.args[1]);
      realm.stack.set(varName, value);
      return value;
    }
    case 'ref': {
      return getDefined(realm.stack.get(getIdentifierString(node)));
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
        return callBuiltin(funcName, args);
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
        return Column.fromDateSequence(
          start,
          end,
          getTimeUnit(getIdentifierString(node.args[2] as AST.Ref))
        );
      } else {
        return Column.fromSequence(
          start,
          end,
          await evaluate(realm, node.args[2])
        );
      }
    }
    case 'date': {
      const [dateMs, specificity] = getDateFromAstForm(node.args);
      return Date.fromDateAndSpecificity(dateMs, specificity);
    }
    case 'column': {
      const values: SimpleValue[] = await pSeries(
        node.args[0].map((v) => () => evaluate(realm, v))
      );

      return Column.fromValues(values);
    }
    case 'table': {
      return evaluateTable(realm, node);
    }
    case 'property-access': {
      const table = getDefined(
        realm.stack.get(getIdentifierString(node.args[0]))
      ) as Column;

      const valueIndex = getDefined(table.valueNames?.indexOf(node.args[1]));

      return getDefined(table.values[valueIndex]);
    }
    case 'function-definition': {
      const funcName = getIdentifierString(getDefined(node.args[0]));
      realm.functions.set(funcName, node);

      // Typecheck ensures this isn't used as a result
      // but we want to always return something
      return Scalar.fromValue(NaN);
    }
    case 'given': {
      return evaluateGiven(realm, node);
    }
    case 'imported-data': {
      // TODO
      const [url, contentType] = node.args;
      return evaluateData(
        realm,
        await resolveData({ url, contentType, fetch: realm.fetch })
      );
    }
  }
}

// If you call this you'll need to rely on the ===
// (object identity equality) of the returned statements.
const desiredTargetsToStatements = (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>
): AST.Statement[] => {
  return desiredTargets.map((target) => {
    if (Array.isArray(target)) {
      return getDefined(
        program[target[0]]?.args[target[1]],
        `Could not find target ${JSON.stringify(target)}`
      );
    } else if (typeof target === 'number') {
      const targetBlock = program[target].args;

      return getDefined(
        targetBlock[targetBlock.length - 1],
        'Cannot get the result of an empty block'
      );
    } else {
      for (const block of program) {
        for (const stmt of block.args) {
          if (
            stmt.type === 'assign' &&
            getIdentifierString(stmt.args[0]) === target
          ) {
            return stmt;
          }
        }
      }

      throw new Error(`Did not find requested variable ${target}`);
    }
  });
};

// Given a program and target symbols/block indices,
// compute a Interpreter.Result (value) for each target
export async function evaluateTargets(
  program: AST.Block[],
  desiredTargets: Array<
    string | number | [blockIdx: number, statementIdx: number]
  >,
  realm = new Realm()
): Promise<Value[]> {
  const targetSet: Map<unknown, Value> = new Map(
    desiredTargetsToStatements(program, desiredTargets).map((target) => [
      target,
      Scalar.fromValue(NaN),
    ])
  );

  for (const block of program) {
    for (const statement of block.args) {
      // TODO should this be parallel?
      // eslint-disable-next-line no-await-in-loop
      const value: Value = await evaluate(realm, statement);

      if (targetSet.has(statement)) {
        targetSet.set(statement, value);
      }
    }
  }

  return [...targetSet.values()];
}
