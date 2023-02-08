import { formatError } from '@decipad/format';
import {
  astNode,
  parseBlock,
  parseStatementOrThrow,
  validateResult,
} from '@decipad/language';
import DeciNumber from '@decipad/number';
import { getOnly, timeout } from '@decipad/utils';
import { Result } from 'libs/language/src/result';
import { AST, Computer, prettyPrintAST } from '.';
import {
  IdentifiedBlock,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  ProgramBlock,
} from './types';
import { getIdentifierString } from './utils';

export const testBlocks = (...blocks: (AST.Block | string)[]): AST.Block[] => {
  return blocks.map((item, index) => {
    if (typeof item === 'string') {
      item = astNode('block', parseStatementOrThrow(item));
    }
    item.id = `block-${index}`;
    return item;
  });
};

export const testProgram = (
  ...blocks: (AST.Block | string)[]
): ProgramBlock[] => {
  return blocks.map((item, index) => {
    if (typeof item === 'string') {
      const { solution: block, error } = parseBlock(item);
      if (error) {
        return {
          type: 'identified-error',
          id: `block-${index}`,
          errorKind: 'parse-error',
          source: item,
          error,
        };
      }
      item = block;
    }
    item.id = `block-${index}`;
    return { type: 'identified-block', id: item.id, block: item };
  });
};

export const computerWithBlocks = async (...blocks: (AST.Block | string)[]) => {
  const computer = new Computer({ requestDebounceMs: 0 });
  computer.pushCompute({ program: testProgram(...blocks) });
  await timeout(0); // debounceMs
  return computer;
};

export const program = testBlocks(
  'A = 1',
  'Unused = 123',
  'B = 2',
  'A + 1',
  'A + B'
);

export const deeperProgram = testBlocks(...program, 'C = B', 'D = C');

export const implicitDepProgram = testBlocks(
  'A = 1',
  'Unused = 123',
  '1',
  '_ + B',
  'C = _',
  'D = _',
  'E = C',
  'F = A'
);

export const pillProgram = testBlocks('A = 1', 'exprRef_block_0');

export const programContainingReassign = testBlocks('A = 1', 'A = 2');

export const programContainingError = testBlocks(
  'A = 1',
  'Error = A + "hi i was supposed to be a number"',
  'A + 1',
  'Error + 1'
);

export function getIdentifiedBlocks(...sources: string[]) {
  return sources.map((source, i) => getIdentifiedBlock(source, i));
}

export const prettyPrintProgramBlock = (block: ProgramBlock) => {
  if (block.type === 'identified-block') {
    return prettyPrintAST(getOnly(block.block.args));
  }
  return `Syntax error: ${block.error?.message}`;
};

export function getIdentifiedBlock(
  source: string,
  i = 0
): IdentifiedBlock | IdentifiedError {
  const { solution: block, error } = parseBlock(source);

  const id = `block-${i}`;

  if (error) {
    return {
      type: 'identified-error',
      id,
      errorKind: 'parse-error',
      source,
      error,
    };
  }

  const stat = block.args[0];

  const definesTableColumn =
    stat.type === 'table-column-assign'
      ? ([
          getIdentifierString(stat.args[0]),
          getIdentifierString(stat.args[1]),
        ] as [string, string])
      : undefined;
  const definesVariable =
    stat.type === 'assign' ? getIdentifierString(stat.args[0]) : undefined;

  block.id = id;

  return {
    type: 'identified-block',
    id,
    block,
    definesTableColumn,
    definesVariable,
  };
}

export const simplifyInBlockResults = (results: IdentifiedResult[]) => {
  const numberToString = (value: Result['value']): string => {
    if (Array.isArray(value))
      return `[${value.map(numberToString).join(', ')}]`;
    return value instanceof DeciNumber
      ? value.toString()
      : JSON.stringify(value);
  };
  const simpleUpdates = [];
  for (const {
    id: blockId,
    result: { type, value },
  } of results) {
    validateResult(type, value);
    const prefix = `${blockId} -> `;

    if (type.kind === 'type-error') {
      simpleUpdates.push(`${prefix}${formatError('en-us', type.errorCause)}`);
    } else {
      simpleUpdates.push(prefix + numberToString(value));
    }
  }
  return simpleUpdates;
};

export const simplifyComputeResponse = (res: NotebookResults | null) => {
  if (res == null) return [`panic`];

  const simpleUpdates = [];

  for (const [, up] of Object.entries(res.blockResults)) {
    if (up.type === 'identified-error') {
      simpleUpdates.push(`${up.id} -> Syntax Error`);
    } else {
      simpleUpdates.push(...simplifyInBlockResults([up]));
    }
  }

  return simpleUpdates;
};
