import * as AutoChange from 'automerge';
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

export const objectToTable = (obj: Record<string, Type>) => {
  const names = [];
  const values = [];

  for (const [name, value] of Object.entries(obj)) {
    names.push(name);
    values.push(value);
  }

  return Type.buildTuple(values, names);
};
