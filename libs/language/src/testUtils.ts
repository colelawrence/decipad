import { parse } from './parser';
import { run } from './interpreter';
import { Column, fromJS } from './interpreter/Value';
import { inferTargetStatement, inferProgram } from './infer';
import { zip } from './utils';
import { Type } from './type';

const parseOneBlock = (source: string): AST.Block[] => {
  const parserInput: Parser.UnparsedBlock[] = [{ id: 'block-id', source }];
  const [parsed] = parse(parserInput);

  expect(parsed.errors).toEqual([]);
  expect(parsed.solutions.length).toEqual(1);

  return [parsed.solutions[0]];
};

export const runCode = async (source: string) => {
  const program = parseOneBlock(source);

  const inferResult = await inferTargetStatement(program, [
    0,
    program[0].args.length - 1,
  ]);
  const value = await run(program, [0]);

  return {
    value,
    type: inferResult,
  };
};

export const runCodeForVariables = async (
  source: string,
  wantedVariables: string[]
) => {
  const program = parseOneBlock(source);

  const inferResult = await inferProgram(program);

  const types = Object.fromEntries(inferResult.variables.entries());

  const erroredType = Object.values(types).find((t) => t.errorCause != null);
  expect(erroredType).toEqual(undefined);

  const variables = await run(program, wantedVariables);

  return {
    types,
    variables: Object.fromEntries(zip(wantedVariables, variables)),
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

export const objectToTupleValue = (
  obj: Record<string, Interpreter.OneResult>
) => {
  const values = Object.values(obj).map((v) => fromJS(v));

  return Column.fromNamedValues(values, Object.keys(obj)).getData();
};
