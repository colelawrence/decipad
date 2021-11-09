import { AST, Parser, InjectableExternalData } from '.';
import { inferBlock, makeContext } from './infer';
import { AnyMapping } from './utils';
import { parse } from './parser';
import { prettyPrintAST } from './parser/utils';
import { Realm, run } from './interpreter';

export const parseOneBlock = (source: string): AST.Block => {
  const parserInput: Parser.UnparsedBlock[] = [{ id: 'block-id', source }];
  const [parsed] = parse(parserInput);

  if (parsed.errors.length > 0) {
    throw new TypeError(parsed.errors[0].message);
  }

  if (parsed.solutions.length !== 1) {
    const solutions = parsed.solutions.map((s) => prettyPrintAST(s));
    console.error(`Multiple solutions: \n${solutions.join('\n')}`);
    throw new TypeError('Multiple solutions');
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

  return {
    value,
    type,
  };
};

export const runCode = async (
  source: string,
  { externalData }: { externalData?: AnyMapping<InjectableExternalData> } = {}
) => {
  const block = parseOneBlock(source);
  return runAST(block, { externalData });
};
