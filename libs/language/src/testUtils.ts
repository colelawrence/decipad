import * as AutoChange from 'automerge';
import { parse } from './parser';
import { run } from './interpreter';
import { inferProgram } from './infer';
import { Computer, ParseResult } from './runtime/computer';
import { Type } from './type';

export const runCode = async (source: string) => {
  const lineCount = source.split('\n').length;
  const syncDoc = AutoChange.from({
    children: [
      {
        children: [
          {
            id: 'block-id',
            type: 'code_block',
            children: [{ text: source }],
          },
        ],
      },
    ],
  });
  const computer = new Computer();
  computer.setContext(syncDoc);
  const parseResult: ParseResult = computer.parse();

  if (!parseResult.ok) return parseResult;

  return await computer.resultAt('block-id', lineCount);
};

export const runCodeForVariables = async (
  source: string,
  wantedVariables: string[]
) => {
  const parserInput: Parser.UnparsedBlock[] = [{ id: 'block-id', source }];
  const [parsed] = parse(parserInput);

  expect(parsed.errors).toEqual([]);
  expect(parsed.solutions.length).toEqual(1);

  const program: AST.Block[] = [parsed.solutions[0]];

  const inferResult = await inferProgram(program);

  const types = Object.fromEntries(inferResult.variables.entries());

  const erroredType = Object.values(types).find((t) => t.errorCause != null);
  expect(erroredType).toEqual(undefined);

  const variables = await run(program, wantedVariables);

  return {
    types,
    variables,
  };
};

export const objectToTupleType = (obj: Record<string, Type>) => {
  const names = [];
  const values = [];

  for (const [name, value] of Object.entries(obj)) {
    names.push(name);
    values.push(value);
  }

  return Type.buildTuple(values, names);
};

export const objectToTupleValue = <V extends unknown>(obj: Record<string, V>) =>
  new Map(Object.entries(obj));
