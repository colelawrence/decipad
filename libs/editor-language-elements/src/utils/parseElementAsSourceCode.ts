import {
  parseExpression,
  parseStatement,
  Program,
  statementToIdentifiedBlock,
} from '@decipad/computer';

/**
 * The main function that passes user code through to computer
 *
 * Ensures only one statement is parsed
 */
export function parseElementAsSourceCode(
  blockId: string,
  source: string,
  sourceKind: 'statement' | 'expression' = 'statement',
  isArtificial = false,
  artificiallyDerivedFrom: string | undefined = undefined
): Program {
  const { solution, error } =
    sourceKind === 'statement'
      ? parseStatement(source)
      : parseExpression(source);

  if (error) {
    return [
      {
        type: 'identified-error',
        errorKind: 'parse-error',
        id: blockId,
        source,
        error,
      },
    ];
  }

  return [
    statementToIdentifiedBlock(
      blockId,
      solution,
      isArtificial,
      artificiallyDerivedFrom
    ),
  ];
}
