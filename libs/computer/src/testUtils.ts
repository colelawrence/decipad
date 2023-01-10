import { formatError } from '@decipad/format';
import DeciNumber from '@decipad/number';
import { astNode, parseBlock, parseStatementOrThrow } from '@decipad/language';
import { getOnly } from '@decipad/utils';
import { AST, prettyPrintAST } from '.';
import {
  ComputePanic,
  ComputeResponse,
  IdentifiedBlock,
  IdentifiedError,
  IdentifiedResult,
  ProgramBlock,
} from './types';

export const testBlocks = (...blocks: (AST.Block | string)[]): AST.Block[] => {
  return blocks.map((item, index) => {
    if (typeof item === 'string') {
      item = astNode('block', parseStatementOrThrow(item));
    }
    item.id = `block-${index}`;
    return item;
  });
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

  block.id = id;

  return { type: 'identified-block', id, block };
}

export const simplifyInBlockResults = (results: IdentifiedResult[]) => {
  const simpleUpdates = [];
  for (const {
    id: blockId,
    result: { type, value },
  } of results) {
    const prefix = `${blockId} -> `;

    if (type.kind === 'type-error') {
      simpleUpdates.push(`${prefix}${formatError('en-us', type.errorCause)}`);
    } else {
      const asString =
        value instanceof DeciNumber ? value.toString() : JSON.stringify(value);
      simpleUpdates.push(prefix + asString);
    }
  }
  return simpleUpdates;
};

export const simplifyComputeResponse = (
  res: ComputeResponse | ComputePanic
) => {
  if (res.type === 'compute-panic') return [`panic: ${res.message ?? ''}`];

  const simpleUpdates = [];

  for (const up of res.updates) {
    if (up.type === 'identified-error') {
      simpleUpdates.push(`${up.id} -> Syntax Error`);
    } else {
      simpleUpdates.push(...simplifyInBlockResults([up]));
    }
  }

  return simpleUpdates;
};
