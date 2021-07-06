import { block, assign, l, r, c } from '../utils';

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
