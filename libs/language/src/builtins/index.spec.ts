import { l } from '../utils';
import { Type, ExtendArgs } from '../type';

import { callBuiltinFunctor } from './index';

const testNode = l('test-node');

const nilPos = {
  line: 2,
  column: 0,
  char: 0,
};

const meter: AST.Unit = {
  unit: 'meter',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};

const second: AST.Unit = {
  unit: 'second',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};

const testBinop = callBuiltinFunctor.bind(null, testNode);

type Test = (build: (a: ExtendArgs) => Type) => void;

const tests: Record<string, Test> = {
  binopFunctor: (build) => {
    const n = build({ type: 'number' });

    expect(testBinop('+', n, n)).toEqual(n);
  },
  cmpFunctor: (build) => {
    const n = build({ type: 'number' });
    const b = build({ type: 'boolean' });

    expect(testBinop('>', n, n)).toEqual(b);

    expect(
      testBinop(
        '>',
        build({ type: 'number', unit: [meter] }),
        build({ type: 'number', unit: [meter] })
      )
    ).toEqual(b);

    expect(testBinop('>', n, build({ type: 'number', unit: [meter] }))).toEqual(
      b
    );

    expect(testBinop('>', build({ type: 'number', unit: [meter] }), n)).toEqual(
      b
    );

    expect(
      testBinop(
        '>',
        build({ type: 'number', unit: [meter] }),
        build({ type: 'number', unit: [second] })
      )
    ).toEqual(b);
  },
};

for (const [testName, testFn] of Object.entries(tests)) {
  it(`${testName} - 1D`, () => {
    testFn((args) => Type.build(args));
  });

  /*
  it(`${testName} - 2D`, () => {
    testFn(args => Type.buildColumn(Type.build(args), 42))
  })
  */
}

/*
describe('callBuiltinFunctor', () => {
  const testBinop = callBuiltinFunctor.bind(null, testNode)

  it.todo('dateCmpFunctor')

  it.todo('if')

  it.todo('contains')
})
*/
