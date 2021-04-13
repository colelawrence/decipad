import { l } from '../utils';
import { Type, ExtendArgs } from '../type';

import { callBuiltin } from './callBuiltin';

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

const testFunctor = callBuiltin.bind(null, testNode);

type Builder = (a: ExtendArgs) => Type
// build, build2, build3, and buildOut will switch dimensionality to test propagation
type Test = (build: Builder, build2: Builder, build3: Builder, buildOut: Builder) => void;

const typeDimTests: Record<string, Test> = {
  'binopFunctor': (build, build2, _, buildOut) => {
    const n = build({ type: 'number' });
    const n2 = build2({ type: 'number' });
    const no = buildOut({ type: 'number' });

    expect(testFunctor('+', n, n2)).toEqual(no);
  },
  cmpFunctor: (build, build2, _, buildOut) => {
    const n = build({ type: 'number' });
    const n2 = build2({ type: 'number' });
    const bo = buildOut({ type: 'boolean' });

    expect(testFunctor('>', n, n2)).toEqual(bo);

    expect(
      testFunctor(
        '>',
        build({ type: 'number', unit: [meter] }),
        build2({ type: 'number', unit: [meter] })
      )
    ).toEqual(bo);

    expect(testFunctor('>', n, build2({ type: 'number', unit: [meter] }))).toEqual(
      bo
    );

    expect(testFunctor('>', build({ type: 'number', unit: [meter] }), n2)).toEqual(
      bo
    );

    expect(
      testFunctor(
        '>',
        build({ type: 'number', unit: [meter] }),
        build2({ type: 'number', unit: [second] })
      )
    ).toEqual(bo);
  },
  if: (build, build2, build3, buildOut) => {
    expect(
      testFunctor(
        'if',
        build({ type: 'boolean' }),
        build2({ type: 'number' }),
        build3({ type: 'number' }),
      )
    ).toEqual(
      buildOut({ type: 'number' })
    )

    expect(
      testFunctor(
        'if',
        build({ type: 'boolean' }),
        build2({ type: 'string' }),
        build3({ type: 'number' }),
      ).errorCause
    ).not.toBeNull()
  }
};

describe.only('callBuiltin', () => {
  it('dateCmpFunctor', () => {
    expect(
      testFunctor('dateequals', Type.buildDate('month'), Type.buildDate('month'))
    ).toEqual(Type.Boolean)

    expect(
      testFunctor('dategte', Type.buildDate('day'), Type.buildDate('month'))
        .errorCause
    ).not.toBeNull()
  })

  it('contains', () => {
    expect(
      testFunctor(
        'contains',
        Type.build({ type: 'number', unit: [meter], rangeness: true }),
        Type.build({ type: 'number', unit: [meter] })
      )
    ).toEqual(Type.Boolean)

    expect(
      testFunctor(
        'contains',
        Type.buildColumn(Type.build({ type: 'number', unit: [meter], rangeness: true }), 3),
        Type.build({ type: 'number', unit: [meter] })
      )
    ).toEqual(Type.buildColumn(Type.Boolean, 3))

    expect(
      testFunctor(
        'contains',
        Type.build({ type: 'number', unit: [meter], rangeness: true }),
        Type.buildColumn(Type.build({ type: 'number', unit: [meter] }), 3),
      )
    ).toEqual(Type.buildColumn(Type.Boolean, 3))

    expect(
      testFunctor(
        'contains',
        Type.build({ type: 'number', unit: [meter], rangeness: true }),
        Type.build({ type: 'number', unit: [second] })
      ).errorCause
    ).not.toBeNull()

    expect(
      testFunctor(
        'contains',
        Type.build({ type: 'number', unit: [meter] }),
        Type.build({ type: 'number', unit: [meter], rangeness: true }),
      ).errorCause
    ).not.toBeNull()
  })
})

for (const [testName, testFn] of Object.entries(typeDimTests)) {
  const build1D = (args: ExtendArgs) => Type.build(args)
  const build2D = (args: ExtendArgs) => Type.buildColumn(build1D(args), 42)
  const build3D = (args: ExtendArgs) => Type.buildColumn(build2D(args), 42)
  const build4D = (args: ExtendArgs) => Type.buildColumn(build3D(args), 42)

  it(`${testName} - 1D`, () => {
    testFn(build1D, build1D, build1D, build1D);
  });

  it(`${testName} - 2D`, () => {
    testFn(build2D, build2D, build2D, build2D)
  })

  it(`${testName} - 1D mixed with 2D`, () => {
    testFn(build1D, build2D, build2D, build2D)
  })

  it(`${testName} - 3D`, () => {
    testFn(build3D, build3D, build3D, build3D)
  })

  it(`${testName} - 1D mixed with 3D`, () => {
    testFn(build1D, build3D, build3D, build3D)
  })

  it(`${testName} - 1D mixed with 4D`, () => {
    testFn(build1D, build4D, build4D, build4D)
  })

  it(`${testName} - 2D mixed with 4D`, () => {
    testFn(build2D, build4D, build4D, build4D)
  })
}
