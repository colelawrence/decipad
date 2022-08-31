import Fraction from '@decipad/fraction';
import { astNode, parseOneStatement } from '@decipad/language';
import { AST } from '.';
import { wrappedParse } from './computer/parse';
import {
  ComputePanic,
  ComputeResponse,
  IdentifiedBlock,
  IdentifiedResult,
  Program,
  UnparsedBlock,
} from './types';

export const testBlocks = (...blocks: (AST.Block | string)[]): AST.Block[] => {
  return blocks.map((item, index) => {
    if (typeof item === 'string') {
      item = astNode('block', parseOneStatement(item));
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

export const programContainingReassign = testBlocks('A = 1', 'A = 2');

export const programContainingError = testBlocks(
  'A = 1',
  'Error = A + "hi i was supposed to be a number"',
  'A + 1',
  'Error + 1'
);

export const unparsedProgram: Program = [
  {
    id: 'block-A',
    type: 'unparsed-block',
    source: 'A = 0',
  },
  {
    id: 'block-B',
    type: 'unparsed-block',
    source: 'B = A + 1',
  },
  {
    id: 'block-C',
    type: 'unparsed-block',
    source: 'C = B + 10',
  },
  {
    id: 'block-D',
    type: 'unparsed-block',
    source: 'D = C + 100',
  },
];

export const getUnparsed = (...blockSources: string[]): UnparsedBlock[] =>
  blockSources.map((source, index) => ({
    type: 'unparsed-block',
    id: `block-${index}`,
    source,
  }));

export const parse = (...sources: string[]) =>
  sources.map((source, i) => {
    const parsed = wrappedParse({
      id: `block-${i}`,
      source,
    }) as IdentifiedBlock;
    expect(parsed.block).toBeDefined();
    return parsed.block;
  });

export const simplifyInBlockResults = (results: IdentifiedResult[]) => {
  const simpleUpdates = [];
  for (const {
    id: blockId,
    result: { type, value },
  } of results) {
    const prefix = `${blockId} -> `;

    if (type.kind === 'type-error') {
      simpleUpdates.push(`${prefix}Type Error`);
    } else {
      const asString =
        value instanceof Fraction ? value.toString() : JSON.stringify(value);
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
    if (up.type === 'computer-parse-error') {
      simpleUpdates.push(`${up.id} -> Syntax Error`);
    } else {
      simpleUpdates.push(...simplifyInBlockResults([up]));
    }
  }

  return simpleUpdates;
};

export const simplifyLocs = (ids: [string, number][]) =>
  ids.map((id) => id.join('/'));
