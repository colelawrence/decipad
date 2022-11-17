import { AnyMapping } from '@decipad/utils';
import { AST, isExpression, Type } from '.';
import { Context, inferBlock, makeContext } from './infer';
import { Realm, run } from './interpreter';
import { parseBlock } from './parser';
import { OneResult, Result, validateResult } from './result';

export const parseBlockOrThrow = (source: string): AST.Block => {
  const parsed = parseBlock(source);

  if (parsed.error) {
    throw new TypeError(parsed.error.message);
  }

  return parsed.solution;
};

export const parseStatementOrThrow = (source: string): AST.Statement => {
  const block = parseBlockOrThrow(source);
  const item = block.args[0];

  return item;
};

export const parseExpressionOrThrow = (source: string): AST.Expression => {
  const block = parseBlockOrThrow(source);
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
  }: RunAstOptions = {}
): Promise<RunAstResult> => {
  const type = await inferBlock(block, ctx);

  const erroredType = type.errorCause != null ? type : null;
  if (erroredType && throwOnError) {
    throw new TypeError(`Type error: ${JSON.stringify(erroredType)}`);
  }

  const [value] = await run([block], [0], new Realm(ctx));

  validateResult(type, value);

  return { type, value };
};

export const runCode = async (source: string, opts: RunAstOptions = {}) => {
  const block = parseBlockOrThrow(source);
  return runAST(block, opts);
};
