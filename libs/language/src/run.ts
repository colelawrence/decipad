import stringify from 'json-stringify-safe';
import { AnyMapping } from '@decipad/utils';
import { AST, isExpression, Type, validateResult } from '.';
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
    throw new TypeError('Expected expression');
  }
  return item;
};

interface RunAstOptions {
  externalData?: AnyMapping<Result>;
  ctx?: Context;
  throwOnError?: boolean;
  doNotValidateResults?: boolean;
  doNotMaterialiseResults?: boolean;
}

interface RunAstResult {
  type: Type;
  value: OneResult;
}

export const runAST = async (
  block: AST.Block,
  {
    externalData,
    ctx = makeContext({ externalData }),
    throwOnError,
    doNotValidateResults,
    doNotMaterialiseResults,
  }: RunAstOptions = {}
): Promise<RunAstResult> => {
  const type = await inferBlock(block, ctx);

  const erroredType = type.errorCause != null ? type : null;
  if (erroredType && throwOnError) {
    throw new TypeError(`Type error: ${stringify(erroredType)}`);
  }

  const results = await run(
    [block],
    [0],
    new Realm(ctx),
    doNotMaterialiseResults
  );
  if (doNotMaterialiseResults) {
    return { type, value: results[0] };
  }
  const [value] = await Promise.all(results.map(materializeOneResult));

  if (!doNotValidateResults) {
    validateResult(type, value);
  }

  return { type, value };
};

export const runCode = async (source: string, opts: RunAstOptions = {}) => {
  const block = parseBlockOrThrow(source);
  return runAST(block, opts);
};
