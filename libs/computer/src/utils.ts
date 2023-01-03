import { AST, SyntaxError, BracketError, walkAst } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { IdentifiedError, IdentifiedResult, ProgramBlock } from './types';

export const getStatement = (
  program: AST.Block[],
  blockId: string
): AST.Statement => {
  return getDefined(
    program.find((b) => b.id === blockId)?.args[0],
    `ComputationGraph: Could not find code line at ${blockId}`
  );
};

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
  findIncrementalDefinitions = true
) => {
  switch (stmt.type) {
    case 'function-definition':
    case 'assign':
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

export const getGoodBlocks = (parsed: ProgramBlock[]) =>
  parsed.flatMap((b) => {
    if (b.type === 'identified-block') return [b.block];
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

export const findSymbolsUsed = (stmt: AST.Statement) => {
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

export const setIntersection = <T>(setA: Set<T>, setB: Set<T>) =>
  new Set([...setA].filter((itemA) => setB.has(itemA)));

export const isSyntaxError = (error: unknown): error is SyntaxError =>
  error instanceof Object &&
  'message' in error &&
  ('token' in error || 'isEmptyExpressionError' in error);

export const isBracketError = (error: unknown): error is BracketError => {
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
): error is { bracketError: BracketError } => {
  return (
    error instanceof Object &&
    'bracketError' in error &&
    isBracketError((error as { bracketError: BracketError }).bracketError)
  );
};

export const identifiedErrorToMessage = (error: IdentifiedError): string => {
  switch (error.errorKind) {
    case 'parse-error': {
      return error.error.message;
    }
    case 'dependency-cycle': {
      return "Number's value depends on itself";
    }
  }
};
