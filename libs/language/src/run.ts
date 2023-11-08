import { AnyMapping } from '@decipad/utils';
import stringify from 'json-stringify-safe';
import { AST, isExpression, prettyPrintAST, Type, validateResult } from '.';
import { Context, inferBlock, makeContext } from './infer';
import { Realm, run } from './interpreter';
import { parseBlock } from './parser';
import { OneResult, Result } from './result';
import { materializeOneResult } from './utils/materializeOneResult';

export const parseBlockOrThrow = (
  source: string,
  id?: string,
  addCacheKeys = false,
  suppressErrorLog = false
): AST.Block => {
  const parsed = parseBlock(source, id, addCacheKeys, suppressErrorLog);

  if (parsed.error) {
    throw new TypeError(parsed.error.message);
  }

  if (id != null) {
    parsed.solution.id = id;
  }

  return parsed.solution;
};

export const parseStatementOrThrow = (source: string): AST.Statement => {
  const block = parseBlockOrThrow(source);
  const item = block.args[0];

  return item;
};

export const parseExpressionOrThrow = (
  source: string,
  addCacheKeys = false,
  suppressErrorLog = false
): AST.Expression => {
  const block = parseBlockOrThrow(
    source,
    undefined,
    addCacheKeys,
    suppressErrorLog
  );
  const item = block.args[0];
  if (!isExpression(item)) {
    throw new TypeError('Expected expression but item was not');
  }
  return item;
};

interface RunAstOptions {
  externalData?: AnyMapping<Result>;
  ctx?: Context;
  realm?: Realm;
  throwOnError?: boolean;
  doNotValidateResults?: boolean;
  doNotMaterialiseResults?: boolean;
}

export interface RunAstResult {
  type: Type;
  value: OneResult;
}
export type RunAstAndGetContextResult = RunAstResult & {
  context: Context;
  realm: Realm;
};

export const runASTAndGetContext = async (
  block: AST.Block,
  {
    externalData,
    ctx = makeContext({ externalData }),
    realm: _realm,
    throwOnError,
    doNotValidateResults,
    doNotMaterialiseResults,
  }: RunAstOptions = {}
): Promise<RunAstAndGetContextResult> => {
  const type = await inferBlock(block, ctx);

  const erroredType = type.errorCause != null ? type : null;
  if (erroredType && throwOnError) {
    throw new TypeError(`Type error: ${stringify(erroredType)}`);
  }

  const realm = _realm || new Realm(ctx);
  const results = await run([block], [0], realm, doNotMaterialiseResults);
  if (doNotMaterialiseResults) {
    return { type, value: results[0], context: ctx, realm };
  }
  const [value] = await Promise.all(results.map(materializeOneResult));

  if (!doNotValidateResults) {
    validateResult(type, value);
  }

  return { type, value, context: ctx, realm };
};

export const runAST = async (
  block: AST.Block,
  options?: RunAstOptions
): Promise<RunAstResult> => {
  const { type, value } = await runASTAndGetContext(block, options);
  return { type, value };
};

export const runCode = async (source: string, opts: RunAstOptions = {}) => {
  const block = parseBlockOrThrow(source);
  prettyPrintAST(block);
  return runAST(block, opts);
};

export const runCodeAndGetContext = async (
  source: string,
  opts: RunAstOptions = {}
) => {
  const block = parseBlockOrThrow(source);
  return runASTAndGetContext(block, opts);
};
