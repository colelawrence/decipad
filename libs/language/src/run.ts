import { AST, InjectableExternalData } from '.';
import { inferBlock, makeContext } from './infer';
import { AnyMapping } from './utils';
import { parseBlock } from './parser';
import { Realm, run } from './interpreter';
import { validateResult } from './result';

export const parseOneBlock = (source: string): AST.Block => {
  const parsed = parseBlock({ id: 'block-id', source });

  if (parsed.errors.length > 0) {
    throw new TypeError(parsed.errors[0].message);
  }

  return parsed.solutions[0];
};

export const runAST = async (
  block: AST.Block,
  { externalData }: { externalData?: AnyMapping<InjectableExternalData> } = {}
) => {
  const ctx = makeContext({ externalData });

  const type = await inferBlock(block, ctx);

  const erroredType = type.errorCause != null ? type : null;
  if (erroredType) {
    throw new TypeError(type.errorCause?.message || 'Type error');
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
