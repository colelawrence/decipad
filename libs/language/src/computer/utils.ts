import { AST } from '..';
import { walk, getIdentifierString, getDefined } from '../utils';
import { ParseRet } from './parse';
import { ValueLocation } from './types';

export const stringifyLoc = (loc: ValueLocation) => loc.join('/');
export const parseLoc = (loc: string) => {
  const [blockId, strIndex, trash] = loc.split('/');
  const statementIndex = Number(strIndex);

  if (!blockId || Number.isNaN(statementIndex) || trash != null) {
    throw new Error(`invalid ValueLocation: ${JSON.stringify(loc)}`);
  }

  return [blockId, statementIndex] as ValueLocation;
};

export class LocationSet {
  set = new Set<string>();

  constructor(contents?: Iterable<ValueLocation>) {
    for (const v of contents ?? []) this.add(v);
  }

  add(value: ValueLocation) {
    this.set.add(stringifyLoc(value));
    return this;
  }

  has(value: ValueLocation) {
    return this.set.has(stringifyLoc(value));
  }

  delete(value: ValueLocation) {
    this.set.delete(stringifyLoc(value));
  }

  [Symbol.iterator]() {
    return [...this.set].map((loc) => parseLoc(loc))[Symbol.iterator]();
  }
}

export class LocationMap<T> {
  map = new Map<string, T>();

  constructor(contents?: Iterable<[ValueLocation, T]>) {
    for (const [k, v] of contents ?? []) this.set(k, v);
  }

  set(key: ValueLocation, value: T) {
    this.map.set(stringifyLoc(key), value);
    return this;
  }

  get(value: ValueLocation) {
    return this.map.get(stringifyLoc(value));
  }

  delete(value: ValueLocation) {
    this.map.delete(stringifyLoc(value));
  }

  [Symbol.iterator]() {
    return [...this.map]
      .map(([loc, value]) => [parseLoc(loc), value])
      [Symbol.iterator]();
  }
}

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

const blockLocs = (block: AST.Block): ValueLocation[] =>
  block.args.map((_stmt, i) => [block.id, i]);

export const getAllBlockLocations = (blocks: AST.Block[]) =>
  blocks.flatMap((block) => blockLocs(block));

export const getSomeBlockLocations = (
  blocks: AST.Block[],
  blockIds: string[]
): ValueLocation[] =>
  blocks.flatMap((block) =>
    blockIds.includes(block.id) ? blockLocs(block) : []
  );

export const getDefinedSymbol = (stmt: AST.Statement) => {
  switch (stmt.type) {
    case 'assign':
      return `var:${getIdentifierString(stmt.args[0])}`;
    case 'function-definition':
      return `fn:${getIdentifierString(stmt.args[0])}`;
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

export const getAllSymbolsDefined = (blocks: AST.Block[]) =>
  blocks.flatMap((block) =>
    block.args.flatMap((statement) => {
      const sym = getDefinedSymbol(statement);
      if (sym != null) return [sym];
      return [];
    })
  );

export const getReferredSymbol = (node: AST.Node) => {
  switch (node.type) {
    case 'ref':
      return `var:${getIdentifierString(node)}`;
    case 'funcref':
      return `fn:${getIdentifierString(node)}`;
    case 'externalref':
      return `externaldata:${getIdentifierString(node)}`;
    default:
      return null;
  }
};

export const parseDefName = (sym: string): ['var' | 'fn', string] => {
  const [, type, rest] = getDefined(
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

export const setIntersection = <T>(setA: Set<T>, setB: Set<T>) =>
  new Set([...setA].filter((itemA) => setB.has(itemA)));
