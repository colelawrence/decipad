import { AST, walkAst } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { getIdentifierString } from '../utils';

const getReferredSymbol = (node: AST.Node) => {
  switch (node.type) {
    case 'ref':
    case 'funcref':
    case 'externalref':
      return getIdentifierString(node);
    default:
      return null;
  }
};

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

export const getDependencies = (stmt: AST.Statement) => {
  const symbols: string[] = [];

  walkAst(stmt, (node) => {
    const sym = getReferredSymbol(node);
    if (sym != null) symbols.push(sym);
  });

  if (stmt.type === 'matrix-assign' || stmt.type === 'table-column-assign') {
    symbols.push(getDefined(getDefinedSymbol(stmt)));
  }

  return symbols;
};
