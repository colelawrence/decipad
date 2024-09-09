import type { AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { parseBlock } from '@decipad/language';
import type {
  IdentifiedBlock,
  IdentifiedError,
  Program,
} from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import { getIdentifierString } from '@decipad/language-utils';

export const getDefinedSymbol = (
  stmt: AST.Statement,
  findIncrementalDefinitions = true
) => {
  switch (stmt.type) {
    case 'function-definition':
    case 'assign':
    case 'table':
    case 'categories':
      return getIdentifierString(stmt.args[0]);
    case 'matrix-assign':
      return findIncrementalDefinitions
        ? getIdentifierString(stmt.args[0])
        : null;
    case 'table-column-assign':
      return findIncrementalDefinitions
        ? getIdentifierString(stmt.args[0])
        : null;
    default:
      return null;
  }
};

export function getIdentifiedBlock(
  source: string,
  i = 0
): IdentifiedBlock | IdentifiedError {
  const id = `block-${i}`;
  const { solution: block, error } = parseBlock(source);

  if (error) {
    return {
      type: 'identified-error',
      id,
      errorKind: 'parse-error',
      source,
      error,
    };
  }

  block.id = id;

  const ret: IdentifiedBlock = { type: 'identified-block', id, block };

  if (block.args[0]?.type === 'table-column-assign') {
    ret.definesTableColumn = [
      block.args[0].args[0].args[0],
      block.args[0].args[1].args[0],
    ];
  } else {
    ret.definesVariable = getDefinedSymbol(block.args[0]) ?? undefined;
  }

  return ret;
}

export function getIdentifiedBlocks(...sources: string[]): Program {
  return sources.map((source, i) => getIdentifiedBlock(source, i));
}
