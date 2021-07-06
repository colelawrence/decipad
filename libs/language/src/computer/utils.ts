import { walk, getIdentifierString, getDefined } from '../utils';
import { ParseRet } from './parse';
import { ValueLocation } from './types';

export const stringifyLoc = (loc: ValueLocation) => `${loc.join(': ')}`;

export const getStatement = (
  program: AST.Block[],
  [blockId, stmtIdx]: ValueLocation
): AST.Statement => {
  return getDefined(
    program.find((b) => b.id === blockId)?.args[stmtIdx],
    `ComputationGraph: Could not find location [${blockId}, ${stmtIdx}]`
  );
};

export const iterProgram = (
  program: AST.Block[],
  fn: (stmt: AST.Statement, loc: [string, number]) => void
) => {
  program.forEach(({ id: blockId, args: statements }) => {
    statements.forEach((statement, statementIndex) => {
      fn(statement, [blockId, statementIndex]);
    });
  });
};

export const getDefinedSymbol = (stmt: AST.Statement) => {
  switch (stmt.type) {
    case 'assign':
      return 'var:' + getIdentifierString(stmt.args[0]);
    case 'function-definition':
      return 'fn:' + getIdentifierString(stmt.args[0]);
    default:
      return null;
  }
};

export const getGoodBlocks = (parsed: ParseRet[]) =>
  parsed.flatMap((b) => {
    if (b.type === 'identified-block') return [b.block];
    else return [];
  });

export const getDefinedSymbolAt = (
  program: AST.Block[],
  loc: ValueLocation
) => {
  const stmt = getStatement(program, loc);

  return stmt != null ? getDefinedSymbol(stmt) : null;
};

export const getReferredSymbol = (node: AST.Node) => {
  switch (node.type) {
    case 'ref':
      return 'var:' + getIdentifierString(node);
    case 'funcref':
      return 'fn:' + getIdentifierString(node);
    default:
      return null;
  }
};

export const parseDefName = (sym: string): ['var' | 'fn', string] => {
  const [_, type, rest] = getDefined(
    sym.match(/^(var|fn):(.*)$/),
    'Expected defname to be in the format var:{name} or fn:{name}'
  );

  return [type as 'var' | 'fn', rest];
};

export const findSymbolsUsed = (stmt: AST.Statement) => {
  const symbols: string[] = [];

  walk(stmt, (node) => {
    const sym = getReferredSymbol(node);
    if (sym != null) symbols.push(sym);
  });

  return symbols;
};
