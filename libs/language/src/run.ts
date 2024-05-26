import {
  Unknown,
  type AST,
  type ExternalDataMap,
  type Result,
  type Type,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { isErrorType, materializeOneResult } from '@decipad/language-types';
import type { TRealm, TScopedInferContext } from '.';
import {
  ScopedRealm,
  isExpression,
  makeInferContext,
  prettyPrintAST,
  validateResult,
} from '.';
import { inferBlock } from './infer';
import { run } from './interpreter';
import { parseBlock } from './parser';

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

export interface RunAstOptions {
  externalData?: ExternalDataMap;
  ctx?: TScopedInferContext;
  realm?: TRealm;
  throwOnError?: boolean;
  doNotValidateResults?: boolean;
  doNotMaterialiseResults?: boolean;
}

export interface RunAstResult {
  type: Type;
  value: Result.OneResult;
}
export type RunAstAndGetContextResult = RunAstResult & {
  context: TScopedInferContext;
  realm: TRealm;
};

export const runASTAndGetContext = async (
  block: AST.Block,
  {
    externalData,
    ctx = makeInferContext({ externalData }),
    realm: _realm,
    throwOnError,
    doNotValidateResults,
    doNotMaterialiseResults,
  }: RunAstOptions = {}
): Promise<RunAstAndGetContextResult> => {
  const realm = _realm || new ScopedRealm(undefined, ctx);
  const type = await inferBlock(block, realm);

  if (isErrorType(type)) {
    if (throwOnError) {
      throw new TypeError(`Type error: ${type.errorCause.message}`);
    }
    return { type, value: Unknown, context: ctx, realm };
  }

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
