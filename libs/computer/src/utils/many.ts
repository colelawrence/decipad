// eslint-disable-next-line no-restricted-imports
import { walkAst, type SyntaxError } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import type { AST, Parser } from '@decipad/language-interfaces';
import type {
  ComputerProgram,
  IdentifiedBlock,
  IdentifiedError,
  IdentifiedResult,
  Program,
} from '@decipad/computer-interfaces';

export const getBlockFromProgram = (
  program: ComputerProgram,
  blockId: string
): AST.Block =>
  getDefined(
    getDefined(
      program.asBlockIdMap.get(blockId),
      `ComputationGraph: Could not find code line at ${blockId}`
    ).block
  );

export const getBlock = (program: AST.Block[], blockId: string): AST.Block =>
  getDefined(
    program.find((b) => b.id === blockId),
    `ComputationGraph: Could not find code line at ${blockId}`
  );

export const getStatement = (
  program: AST.Block[],
  blockId: string
): AST.Statement => {
  return getDefined(
    program.find((b) => b.id === blockId)?.args[0],
    `ComputationGraph: Could not find code line at ${blockId}`
  );
};

export const getStatementFromProgram = (
  program: ComputerProgram,
  blockId: string
): AST.Statement | undefined =>
  program.asBlockIdMap.get(blockId)?.block?.args[0];

export const iterProgram = (
  program: AST.Block[],
  fn: (stmt: AST.Statement, loc: string) => void
) => {
  program.forEach(({ id: blockId, args: statements }) => {
    fn(statements[0], blockId);
  });
};

export const getExistingBlockIds = (
  blocks: AST.Block[],
  blockIds: Set<string>
): string[] =>
  blocks.flatMap((block) => (blockIds.has(block.id) ? [block.id] : []));

export const getIdentifierString = (ident: AST.Identifier): string =>
  ident.args[0];

export const getDefinedSymbol = (
  stmt: AST.Statement,
  findIncrementalDefinitions = true,
  excludeTypes: Set<AST.Node['type']> = new Set()
) => {
  if (excludeTypes.has(stmt.type)) return null;
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

export const getGoodBlocks = (parsed: Program) =>
  parsed.flatMap((b) => {
    if (b.type === 'identified-block') return [b];
    else return [];
  });

export const getAllSymbolsDefined = (blocks: AST.Block[]) =>
  blocks.flatMap((block) =>
    block.args.flatMap((statement) => {
      const sym = getDefinedSymbol(statement);
      if (sym != null) return [sym];
      else return [];
    })
  );

export function* getSymbolsDefinedInBlocks(
  program: AST.Block[],
  blockIds: string[]
) {
  for (const loc of blockIds) {
    const sym = getDefinedSymbol(getStatement(program, loc));
    if (sym != null) yield sym;
  }
}

const getReferredSymbol = (
  node: AST.Node,
  excludeTypes: ReadonlySet<AST.Node['type']>
) => {
  if (excludeTypes.has(node.type)) return null;
  switch (node.type) {
    case 'ref':
    case 'funcref':
    case 'externalref':
      return getIdentifierString(node);
    default:
      return null;
  }
};

export const findSymbolsUsed = (
  stmt: AST.Statement,
  excludeTypes: ReadonlySet<AST.Node['type']> = new Set()
) => {
  const symbols: string[] = [];

  walkAst(stmt, (node) => {
    const sym = getReferredSymbol(node, excludeTypes);
    if (sym != null) symbols.push(sym);
  });

  if (stmt.type === 'matrix-assign' || stmt.type === 'table-column-assign') {
    symbols.push(getDefined(getDefinedSymbol(stmt)));
  }

  return symbols;
};

export const setIntersection = <T>(setA: Set<T>, setB: Set<T>) =>
  new Set([...setA].filter((itemA) => setB.has(itemA)));

export const isSyntaxError = (error: unknown): error is SyntaxError =>
  error instanceof Object &&
  'message' in error &&
  ('token' in error || 'isEmptyExpressionError' in error);

export const isBracketError = (
  error: unknown
): error is Parser.BracketError => {
  return (
    error instanceof Object &&
    'type' in error &&
    ('close' in error || 'open' in error)
  );
};

export const isTypeError = (
  error?: IdentifiedResult | IdentifiedError | null
): error is IdentifiedResult & {
  type: { kind: 'type-error' };
} => {
  return Boolean(
    error &&
      error.type === 'computer-result' &&
      error.result.type.kind === 'type-error'
  );
};

export const hasBracketError = (
  error: unknown
): error is { bracketError: Parser.BracketError } => {
  return (
    error instanceof Object &&
    'bracketError' in error &&
    isBracketError(
      (error as { bracketError: Parser.BracketError }).bracketError
    )
  );
};

export const identifiedErrorToMessage = (error: IdentifiedError): string => {
  console.error(error.error);
  switch (error.errorKind) {
    case 'parse-error': {
      return error.error.message;
    }
    case 'dependency-cycle': {
      return "Number's value depends on itself";
    }
  }
};

export function statementToIdentifiedBlock(
  id: string,
  stat: AST.Statement,
  isArtificial?: boolean,
  artificiallyDerivedFrom?: Array<string>
): IdentifiedBlock {
  const varName = getDefinedSymbol(stat, true);
  let defs: Partial<IdentifiedBlock> = {};

  if (stat?.type === 'table-column-assign' && varName != null) {
    const [, col] = stat.args;
    defs = { definesTableColumn: [varName, getIdentifierString(col)] };
  } else if (varName != null) {
    defs = { definesVariable: varName };
  }

  return {
    type: 'identified-block',
    id,
    block: { id, type: 'block', args: [stat] },
    ...defs,
    isArtificial,
    artificiallyDerivedFrom,
  };
}
