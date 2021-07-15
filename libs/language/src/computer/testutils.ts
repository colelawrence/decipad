import { block, assign, l, r, c } from '../utils';
import { AST, Parser } from '..';
import {
  ComputePanic,
  ComputeResponse,
  InBlockResult,
  IdentifiedBlock,
} from './types';
import { wrappedParse } from './parse';

const testBlocks = (...blocks: AST.Block[]) => {
  blocks.forEach((block, index) => {
    block.id = `block-${index}`;
  });
  return blocks;
};

export const program = testBlocks(
  block(assign('A', l(1)), assign('Unused', l(123))),
  block(assign('B', l(2)), c('+', r('A'), l(1)), c('+', r('A'), r('B')))
);

export const deeperProgram = testBlocks(
  ...program,
  block(assign('C', r('B')), assign('D', r('C')))
);

export const programContainingReassign = testBlocks(
  block(assign('A', l(1))),
  block(assign('A', l(2)))
);

export const programContainingError = testBlocks(
  block(
    assign('A', l(1)),
    assign('Error', c('+', r('A'), l('hi i was supposed to be a number'))),
    c('+', r('A'), l(1)),
    c('+', r('Error'), l(1))
  )
);

export const unparsedProgram: Parser.UnparsedBlock[] = [
  {
    id: 'block-AB',
    source: 'A = 0\nB = A + 1',
  },
  {
    id: 'block-C',
    source: 'C = B + 10',
  },
  {
    id: 'block-D',
    source: 'D = C + 100',
  },
];

export const getUnparsed = (...blockSources: string[]) =>
  blockSources.map((source, index) => ({ id: `block-${index}`, source }));

export const parse = (...sources: string[]) =>
  sources.map((source, i) => {
    const parsed = wrappedParse({
      id: 'block-' + i,
      source,
    }) as IdentifiedBlock;
    expect(parsed.block).toBeDefined();
    return parsed.block;
  });

export const simplifyInBlockResults = (results: InBlockResult[]) => {
  const simpleUpdates = [];
  for (const { blockId, statementIndex, valueType, value } of results) {
    const prefix = blockId + '/' + statementIndex + ' -> ';

    if (valueType.errorCause != null) {
      simpleUpdates.push(prefix + 'Type Error');
    } else {
      simpleUpdates.push(prefix + JSON.stringify(value));
    }
  }
  return simpleUpdates;
};

export const simplifyComputeResponse = (
  res: ComputeResponse | ComputePanic
) => {
  if (res.type === 'compute-panic') return ['panic: ' + (res.message ?? '')];

  const simpleUpdates = [];

  for (const { blockId, isSyntaxError, results } of res.updates) {
    if (isSyntaxError) {
      simpleUpdates.push(blockId + ' -> Syntax Error');
    } else {
      simpleUpdates.push(...simplifyInBlockResults(results));
    }
  }

  return simpleUpdates;
};
