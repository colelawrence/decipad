import { hasBuiltin, builtins } from '../builtins';
import { getOfType, getDefined, getIdentifierString, pairwise } from '../utils';
import { reduceValuesThroughDims } from '../dimtools';
import { getDateFromAstForm } from '../date';

import { Realm } from './Realm';
import {
  Scalar,
  Range,
  Date,
  Column,
  SimpleValue,
  Value,
  fromJS,
} from './Value';
import { getLargestColumn, evaluateTableColumn } from './column';

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
        const builtin = builtins[funcName];
        return reduceValuesThroughDims(
          args,
          (argsLowerDims) => {
            const argData = argsLowerDims.map((a) => a.getData());

            return fromJS(builtin.fn(...argData));
          },
          { reduces: builtin.reduces }
        );
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
      const [start, end] = node.args.map((arg) =>
        evaluate(realm, arg).asScalar()
      );

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
      const colNames: string[] = [];
      const colValues: SimpleValue[] = [];
      const columns = node.args;

      return realm.stack.withPush(() => {
        for (const [def, column] of pairwise<AST.ColDef, AST.Expression>(
          columns
        )) {
          const colName = getIdentifierString(def);
          const columnData = evaluateTableColumn(
            realm,
            column,
            getLargestColumn(colValues)
          );

          realm.stack.set(colName, columnData);

          colValues.push(columnData);
          colNames.push(colName);
        }

        return Column.fromNamedValues(colValues, colNames);
      });
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
      const [ref, body] = node.args;

      const predicateName = getIdentifierString(ref);
      const predicate = evaluate(realm, ref);

      if (!(predicate instanceof Column)) {
        throw new Error('panic: expected column');
      }

      return realm.stack.withPush(() => {
        if (predicate.valueNames != null) {
          // It's a table

          const columns = predicate.values as Column[];
          const colNames = predicate.valueNames;
          const length = getDefined(columns[0].values.length);

          const mapped = Array.from({ length })
            .fill(null)
            .map((_, index) => {
              const thisRow = Column.fromNamedValues(
                columns.map((p) => p.values[index]),
                colNames
              );
              realm.stack.set(predicateName, thisRow);

              return evaluate(realm, body);
            });

          if (mapped.some((m) => m instanceof Column && m.valueNames != null)) {
            // A row was returned in the body -- re-column-orient the table!
            const newColumns = columns.map((column) => {
              const newColumn = Array.from({ length }).map(
                (_, rowIndex) => column.values[rowIndex]
              );

              return Column.fromValues(newColumn);
            });

            return Column.fromNamedValues(newColumns, colNames);
          }

          return Column.fromValues(mapped);
        } else {
          const mapped = predicate.values.map((value) => {
            realm.stack.set(predicateName, value);

            return evaluate(realm, body);
          });

          return Column.fromValues(mapped);
        }
      });
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
