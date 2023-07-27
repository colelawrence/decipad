import stringify from 'json-stringify-safe';
import { formatError } from '@decipad/format';
import {
  astNode,
  parseBlock,
  parseStatementOrThrow,
  validateResult,
} from '@decipad/language';
import DeciNumber from '@decipad/number';
import { getOnly, timeout } from '@decipad/utils';
import { all } from '@decipad/generator-utils';
import { Result } from 'libs/language/src/result';
import { AST, Computer, Program, prettyPrintAST } from '.';
import {
  ComputerProgram,
  IdentifiedBlock,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  ProgramBlock,
} from './types';
import {
  getDefinedSymbol,
  getIdentifierString,
  getResultGenerator,
} from './utils';
import { programToComputerProgram } from './utils/programToComputerProgram';

export const testProgramBlocks = (
  ...blocks: (AST.Block | string)[]
): ComputerProgram =>
  programToComputerProgram(
    testBlocks(...blocks).map((block) => ({
      id: block.id,
      type: 'identified-block',
      block,
    }))
  );

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
  const computer = new Computer({ initialProgram: testProgram(...blocks) });
  await timeout(0); // debounceMs
  return computer;
};

export const program = testBlocks(
  'A = 1',
  'Unused = 123',
  'B1 = 2',
  'A + 1',
  'A + B1'
);

export const deeperProgram = testBlocks(...program, 'C = B1', 'D = C');

export const implicitDepProgram = testBlocks(
  'A = 1',
  'Unused = 123',
  '1',
  '_ + B1',
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

export function getIdentifiedBlocks(...sources: string[]): Program {
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
  const id = `block-${i}`;
  const { solution: block, error } = parseBlock(source);

  if (error) {
    return {
      type: 'identified-error',
      id,
      errorKind: 'parse-error',
      source,
      error,
    };
  }

  block.id = id;

  const ret: IdentifiedBlock = { type: 'identified-block', id, block };

  if (block.args[0]?.type === 'table-column-assign') {
    ret.definesTableColumn = [
      getIdentifierString(block.args[0].args[0]),
      getIdentifierString(block.args[0].args[1]),
    ];
  } else {
    ret.definesVariable = getDefinedSymbol(block.args[0]) ?? undefined;
  }

  return ret;
}

export const simplifyInBlockResults = async (results: IdentifiedResult[]) => {
  const numberToString = async (value: Result['value']): Promise<string> => {
    if (Array.isArray(value))
      return `[${(await Promise.all(value.map(numberToString))).join(', ')}]`;
    if (typeof value === 'function') {
      const materializedResults = await all(getResultGenerator(value)());
      return numberToString(materializedResults);
    }
    return value instanceof DeciNumber ? value.toString() : stringify(value);
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
      // eslint-disable-next-line no-await-in-loop
      simpleUpdates.push(prefix + (await numberToString(value)));
    }
  }
  return simpleUpdates;
};

export const simplifyComputeResponse = async (
  res: NotebookResults | null
): Promise<string[]> => {
  if (res == null) return [`panic`];

  return (
    await Promise.all(
      Object.entries(res.blockResults).map(async ([, up]) => {
        if (up.type === 'identified-error') {
          return `${up.id} -> Syntax Error`;
        } else {
          return simplifyInBlockResults([up]);
        }
      })
    )
  ).flat();
};

export const prettyPrintWholeProgramBlock = (
  programBlock: ProgramBlock
): unknown => {
  if (programBlock.type === 'identified-error') {
    return programBlock;
  }
  return {
    ...programBlock,
    block: prettyPrintAST(programBlock.block),
  };
};

export const prettyPrintProgram = (program: Program): unknown =>
  program.map(prettyPrintWholeProgramBlock);
