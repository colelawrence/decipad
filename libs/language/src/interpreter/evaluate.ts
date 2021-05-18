import { hasBuiltin } from '../builtins';
import { getOfType, getDefined, getIdentifierString } from '../utils';
import { getDateFromAstForm } from '../date';

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
import { callBuiltin } from './callBuiltin';

// Gets a single value from an expanded AST.
export function evaluate(realm: Realm, node: AST.Statement): SimpleValue {
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
            'not implemented: literals with type ' + node.args[0]
          );
        }
      }
    }
    case 'time-quantity': {
      return TimeQuantity.fromASTArgs(node.args);
    }
    case 'assign': {
      const varName = getIdentifierString(node.args[0]);
      const value = evaluate(realm, node.args[1]);
      realm.stack.set(varName, value);
      return value;
    }
    case 'ref': {
      return getDefined(realm.stack.get(getIdentifierString(node)));
    }
    case 'function-call': {
      const funcName = getIdentifierString(node.args[0]);
      const funcArgs = getOfType('argument-list', node.args[1]).args;
      const args = funcArgs.map((arg) => evaluate(realm, arg));

      if (funcName === 'previous') {
        return realm.previousValue ?? args[0];
      } else if (hasBuiltin(funcName)) {
        return callBuiltin(funcName, args);
      } else {
        const customFunc = getDefined(realm.functions.get(funcName));

        return realm.stack.withPush(() => {
          for (let i = 0; i < args.length; i++) {
            const argName = getIdentifierString(customFunc.args[1].args[i]);

            realm.stack.set(argName, args[i]);
          }

          const funcBody: AST.Block = customFunc.args[2];

          for (let i = 0; i < funcBody.args.length; i++) {
            const value = evaluate(realm, funcBody.args[i]);

            if (i === funcBody.args.length - 1) {
              return value;
            }
          }

          throw new Error('function is empty');
        });
      }
    }
    case 'range': {
      const [start, end] = node.args.map((arg) => evaluate(realm, arg));

      return Range.fromBounds(start, end);
    }
    case 'date': {
      const [dateMs, specificity] = getDateFromAstForm(node.args);
      return Date.fromDateAndSpecificity(dateMs, specificity);
    }
    case 'column': {
      const values: SimpleValue[] = node.args[0].map((v) => evaluate(realm, v));

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
      return getDefined(program[target[0]].args[target[1]]);
    } else if (typeof target === 'number') {
      const targetBlock = program[target].args;

      return getDefined(targetBlock[targetBlock.length - 1]);
    } else {
      return getDefined(
        program.flatMap((block) => {
          return (
            block.args.find(
              (statement) =>
                statement.type === 'assign' &&
                getIdentifierString(statement.args[0]) === target
            ) ?? []
          );
        })[0]
      );
    }
  });
};

// Given a program and target symbols/block indices,
// compute a Interpreter.Result (value) for each target
export function evaluateTargets(
  program: AST.Block[],
  desiredTargets: Array<
    string | number | [blockIdx: number, statementIdx: number]
  >,
  realm = new Realm()
): Value[] {
  const targetSet: Map<unknown, Value> = new Map(
    desiredTargetsToStatements(program, desiredTargets).map((target) => [
      target,
      Scalar.fromValue(NaN),
    ])
  );

  for (const block of program) {
    for (const statement of block.args) {
      const value: Value = evaluate(realm, statement);

      if (targetSet.has(statement)) {
        targetSet.set(statement, value);
      }
    }
  }

  return [...targetSet.values()];
}
