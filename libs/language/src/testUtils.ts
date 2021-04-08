import * as AutoChange from 'automerge';
import { Computer, ParseResult } from './runtime/computer';

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
