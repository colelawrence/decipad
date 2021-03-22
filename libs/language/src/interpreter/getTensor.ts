import * as tf from "@tensorflow/tfjs-core";

import { builtins } from "../builtins";
import { getOfType, getDefined, getIdentifierString } from "../utils";
import { Realm } from "./Realm";
import { Table } from './types'

function castToColumns(table: Table): Table {
  const sizes: Set<number> = new Set(Object.values(table).map(t => t.shape.length === 0 ? 0 : t.shape[0]))

  if (sizes.size === 1) {
    return table
  } else {
    const largestSize = Math.max(...sizes)

    const sameSized = Object.entries(table)
      .map(([key, value]) => {
        if (value.shape.length > 0) {
          return [key, value]
        } else {
          // Turn non-column into a [1] and tile it to fit the size of the table
          return [key, tf.tile(tf.reshape(value, [1]), [largestSize])]
        }
      })

    return Object.fromEntries(sameSized)
  }
}

// Gets a single tensor from an expanded AST.
export function getTensor(realm: Realm, node: AST.Statement): tf.Tensor {
  switch (node.type) {
    case "literal": {
      switch (node.args[0]) {
        case 'number':
        case 'boolean': {
          return tf.tensor(node.args[1])
        }
        default: {
          throw new Error('not implemented: literals with type ' + node.args[0])
        }
      }
    }
    case "assign": {
      const varName = getIdentifierString(node.args[0]);
      const value = getTensor(realm, node.args[1]);
      realm.stack.set(varName, value);
      return value;
    }
    case "ref": {
      return getDefined(realm.stack.get(getIdentifierString(node)));
    }
    case "function-call": {
      const funcName = getIdentifierString(node.args[0]);
      const funcArgs = getOfType("argument-list", node.args[1]).args;
      const args = funcArgs.map((arg) => getTensor(realm, arg));

      const builtinName = builtins.binary[funcName] ?? builtins.unary[funcName];

      if (builtinName != null) {
        const tfFunction = getDefined(
          (tf as any)[builtinName]
        );

        return tfFunction(...args) as tf.Tensor;
      } else {
        const customFunc = getDefined(realm.functions.get(funcName));

        return realm.stack.withPush(() => {
          for (let i = 0; i < args.length; i++) {
            const argName = getIdentifierString(customFunc.args[1].args[i]);

            realm.stack.set(argName, args[i]);
          }

          const funcBody: AST.Block = customFunc.args[2];

          for (let i = 0; i < funcBody.args.length; i++) {
            const value = getTensor(realm, funcBody.args[i]);

            if (i === funcBody.args.length - 1) {
              return value;
            }
          }

          throw new Error("function is empty");
        });
      }
    }
    case "conditional": {
      return tf.where(
        getTensor(realm, node.args[0]),
        getTensor(realm, node.args[1]),
        getTensor(realm, node.args[2])
      );
    }
    case "column": {
      const items: tf.Tensor[] = node.args[0].map((v: AST.Expression) =>
        tf.reshape(getTensor(realm, v), [1])
      )
      return tf.concat(items)
    }
    case "table-definition": {
      const table: Table = {}
      const tableName = getIdentifierString(node.args[0])
      const columns: AST.TableColumns = node.args[1]

      realm.stack.withPush(() => {
        // Pairwise iteration
        for (let i = 0; i + 1 < columns.args.length; i += 2) {
          const [def, column] = [columns.args[i], columns.args[i + 1]]
          const colName = getIdentifierString(def as AST.ColDef)

          const tensor = getTensor(realm, column as AST.Expression)
          realm.stack.set(colName, tensor)

          table[colName] = tensor
        }
      })

      realm.tables.set(tableName, castToColumns(table))

      return tf.tensor([NaN])
    }
    case "function-definition": {
      const funcName = getIdentifierString(getDefined(node.args[0]));
      realm.functions.set(funcName, node);

      // Typecheck ensures this isn't used as a result
      // but we want to always return something
      return tf.tensor([NaN]);
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
    } else if (typeof target === "number") {
      const targetBlock = program[target].args;

      return getDefined(targetBlock[targetBlock.length - 1]);
    } else {
      return getDefined(
        program.flatMap((block) => {
          return (
            block.args.find(
              (statement) =>
                statement.type === "assign" &&
                getIdentifierString(statement.args[0]) === target
            ) ?? []
          );
        })[0]
      );
    }
  });
};

// Given a program and target symbols/block indices,
// compute a tensor that aggregates the results of each target, one by one.
// For GC reasons, call this wrapped in tf.tidy(() => getTensor(...)
export function getTensorWithTargets(
  program: AST.Block[],
  desiredTargets: Array<
    string | number | [blockIdx: number, statementIdx: number]
  >
): (tf.Tensor | Table)[] {
  const realm = new Realm();
  const targetSet: Map<unknown, (tf.Tensor | Table)> = new Map(
    desiredTargetsToStatements(program, desiredTargets).map((target) => [
      target,
      tf.tensor([NaN]),
    ])
  );

  for (const block of program) {
    for (const statement of block.args) {
      let value: tf.Tensor | Table = getTensor(realm, statement);
      if (statement.type === 'table-definition') {
        const tableName = getIdentifierString(statement.args[0])
        value = getDefined(realm.tables.get(tableName))
      }

      if (targetSet.has(statement)) {
        targetSet.set(statement, value);
      }
    }
  }

  return [...targetSet.values()]
}
