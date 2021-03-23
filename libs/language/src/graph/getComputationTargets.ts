import { getIdentifierString, n } from '../utils';
import { expandExpression } from './expansion';

/*

Problem:
Given:
 - a program, of type AST.Block[]

Compute a cache Map of VarName => Expression, wherein VarName is one of the checkpoints and Expression does not contain function calls, but may contain Refs to other VarNames

Solution:
 - For each assignment, expand its function calls but not refs, and place the result in the cache

*/

const expandExpressionOrAssignment = (
  program: AST.Block[],
  statement: AST.Statement | null,
  transparentAssignments = false
): AST.Expression | null => {
  if (statement == null) {
    return null;
  }

  switch (statement.type) {
    case 'function-definition': {
      return null;
    }

    case 'assign': {
      if (transparentAssignments) {
        return n('ref', getIdentifierString(statement.args[0]));
      } else {
        return expandExpression(program, statement.args[1], false);
      }
    }

    default: {
      return expandExpression(program, statement, false);
    }
  }
};

export function getComputationTargets(program: AST.Block[]) {
  const targets = new Map<
    string | number | [blockIdx: number, statementIdx: number],
    AST.Expression | null
  >();

  for (let blockIdx = 0; blockIdx < program.length; blockIdx++) {
    const block = program[blockIdx];

    for (
      let statementIdx = 0;
      statementIdx < block.args.length;
      statementIdx++
    ) {
      const statement = block.args[statementIdx];

      if (statement.type === 'assign') {
        targets.set(
          getIdentifierString(statement.args[0]),
          expandExpressionOrAssignment(program, statement)
        );
      }

      if (statement.type !== 'function-definition') {
        const statementId: [number, number] = [blockIdx, statementIdx];

        targets.set(
          statementId,
          expandExpressionOrAssignment(program, statement)
        );
      }
    }

    const lastStatement = block.args[block.args.length - 1];
    targets.set(
      blockIdx,
      lastStatement?.type === 'assign'
        ? n('ref', getIdentifierString(lastStatement.args[0]))
        : expandExpressionOrAssignment(program, lastStatement)
    );
  }

  return targets;
}
