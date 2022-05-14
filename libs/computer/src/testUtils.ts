import Fraction from '@decipad/fraction';
import { astNode, parseOneStatement } from '@decipad/language';
import { AST } from '.';
import {
  ComputePanic,
  ComputeResponse,
  InBlockResult,
  IdentifiedBlock,
  Program,
  UnparsedBlock,
} from './types';
import { wrappedParse } from './computer/parse';

const block = (...items: AST.Statement[]) => astNode('block', ...items);

export const testBlocks = (...blocks: (AST.Block | string)[]): AST.Block[] => {
  return blocks.map((item, index) => {
    if (typeof item === 'string') {
      item = block(parseOneStatement(item));
    }
    item.id = `block-${index}`;
    return item;
  });
};

export const program = testBlocks(
  block(parseOneStatement('A = 1'), parseOneStatement('Unused = 123')),
  block(
    parseOneStatement('B = 2'),
    parseOneStatement('A + 1'),
    parseOneStatement('A + B')
  )
);

export const deeperProgram = testBlocks(
  ...program,
  block(parseOneStatement('C = B'), parseOneStatement('D = C'))
);

export const implicitDepProgram = testBlocks(
  block(parseOneStatement('A = 1'), parseOneStatement('Unused = 123')),
  '1',
  '_ + B',
  block(parseOneStatement('C = _'), parseOneStatement('D = _')),
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
    id: 'block-AB',
    type: 'unparsed-block',
    source: 'A = 0\nB = A + 1',
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

export const simplifyInBlockResults = (results: InBlockResult[]) => {
  const simpleUpdates = [];
  for (const { blockId, statementIndex, type, value } of results) {
    const prefix = `${blockId}/${statementIndex} -> `;

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

  for (const { blockId, isSyntaxError, results } of res.updates) {
    if (isSyntaxError) {
      simpleUpdates.push(`${blockId} -> Syntax Error`);
    } else {
      simpleUpdates.push(...simplifyInBlockResults(results));
    }
  }

  return simpleUpdates;
};

export const simplifyLocs = (ids: [string, number][]) =>
  ids.map((id) => id.join('/'));
