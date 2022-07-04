import { AnyMapping } from '@decipad/utils';
import { AST, InjectableExternalData, isExpression, Type } from '.';
import { Context, inferBlock, makeContext } from './infer';
import { Realm, run } from './interpreter';
import { parseBlock } from './parser';
import { OneResult, validateResult } from './result';

export const parseOneBlock = (source: string): AST.Block => {
  const parsed = parseBlock({ id: 'block-id', source });

  if (parsed.errors.length > 0) {
    throw new TypeError(parsed.errors[0].message);
  }

  return parsed.solutions[0];
};

export const parseOneStatement = (source: string): AST.Statement => {
  const block = parseOneBlock(source);
  const item = block.args[0];

  return item;
};

export const parseOneExpression = (source: string): AST.Expression => {
  const block = parseOneBlock(source);
  const item = block.args[0];
  if (!isExpression(item)) {
    throw new TypeError('Expected expression');
  }
  return item;
};

interface RunAstOptions {
  externalData?: AnyMapping<InjectableExternalData>;
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

export const runCode = async (
  source: string,
  { externalData }: { externalData?: AnyMapping<InjectableExternalData> } = {}
) => {
  const block = parseOneBlock(source);
  return runAST(block, { externalData });
};
