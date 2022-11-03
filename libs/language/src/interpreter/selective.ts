// If you call this you'll need to rely on the ===

import { AST } from '..';
import { getDefined, getIdentifierString } from '../utils';
import { evaluateStatement } from './evaluate';
import { Realm } from './Realm';
import { UnknownValue, Value } from '../value';

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
  realm: Realm
): Promise<Value[]> {
  const targetSet: Map<unknown, Value> = new Map(
    desiredTargetsToStatements(program, desiredTargets).map((target) => [
      target,
      UnknownValue,
    ])
  );

  for (const block of program) {
    for (const statement of block.args) {
      // eslint-disable-next-line no-await-in-loop
      const value: Value = await evaluateStatement(realm, statement);

      if (targetSet.has(statement)) {
        targetSet.set(statement, value);
      }
    }
  }

  return Array.from(targetSet.values());
}
