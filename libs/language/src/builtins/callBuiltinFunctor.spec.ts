import { AST } from '..';
import { Type, ExtendArgs } from '../type';

import { callBuiltinFunctor } from './callBuiltinFunctor';

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

describe('callBuiltin', () => {
  it('dateCmpFunctor', () => {
    expect(
      callBuiltinFunctor(
        'dateequals',
        Type.buildDate('month'),
        Type.buildDate('month')
      )
    ).toEqual(Type.Boolean);

    expect(
      callBuiltinFunctor(
        'dategte',
        Type.buildDate('day'),
        Type.buildDate('month')
      ).errorCause
    ).not.toBeNull();
  });

  it('contains', () => {
    expect(
      callBuiltinFunctor(
        'contains',
        Type.buildRange(Type.build({ type: 'number', unit: [meter] })),
        Type.build({ type: 'number', unit: [meter] })
      )
    ).toEqual(Type.Boolean);

    expect(
      callBuiltinFunctor(
        'contains',
        Type.buildColumn(
          Type.buildRange(Type.build({ type: 'number', unit: [meter] })),
          3
        ),
        Type.build({ type: 'number', unit: [meter] })
      )
    ).toEqual(Type.buildColumn(Type.Boolean, 3));

    expect(
      callBuiltinFunctor(
        'contains',
        Type.buildRange(Type.build({ type: 'number', unit: [meter] })),
        Type.buildColumn(Type.build({ type: 'number', unit: [meter] }), 3)
      )
    ).toEqual(Type.buildColumn(Type.Boolean, 3));

    expect(
      callBuiltinFunctor(
        'contains',
        Type.buildRange(Type.build({ type: 'number', unit: [meter] })),
        Type.build({ type: 'number', unit: [second] })
      ).errorCause
    ).not.toBeNull();

    expect(
      callBuiltinFunctor(
        'contains',
        Type.build({ type: 'number', unit: [meter] }),
        Type.buildRange(Type.build({ type: 'number', unit: [meter] }))
      ).errorCause
    ).not.toBeNull();
  });

  it('errors', () => {
    expect(
      callBuiltinFunctor('unknownFn', Type.Number).errorCause
    ).not.toBeNull();

    expect(callBuiltinFunctor('if', Type.Number).errorCause).not.toBeNull();
  });
});

type Builder = (a: ExtendArgs) => Type;
// build, build2, build3, and buildOut will switch dimensionality to test propagation
type Test = (
  build: Builder,
  build2: Builder,
  build3: Builder,
  buildOut: Builder
) => void;

const typeDimTests: Record<string, Test> = {
  binopFunctor: (build, build2, _, buildOut) => {
    const n = build({ type: 'number' });
    const n2 = build2({ type: 'number' });
    const out = buildOut({ type: 'number' });

    expect(callBuiltinFunctor('+', n, n2)).toEqual(out);
  },
  cmpFunctor: (build, build2, _, buildOut) => {
    const n = build({ type: 'number' });
    const n2 = build2({ type: 'number' });
    const out = buildOut({ type: 'boolean' });

    expect(callBuiltinFunctor('>', n, n2)).toEqual(out);

    expect(
      callBuiltinFunctor(
        '>',
        build({ type: 'number', unit: [meter] }),
        build2({ type: 'number', unit: [meter] })
      )
    ).toEqual(out);

    expect(
      callBuiltinFunctor(
        '>',
        build({ type: 'number', unit: [meter] }),
        build2({ type: 'number', unit: null })
      )
    ).toEqual(out);

    expect(
      callBuiltinFunctor(
        '>',
        build({ type: 'number', unit: [meter] }),
        build2({ type: 'number', unit: [second] })
      ).errorCause!.spec
    ).toHaveProperty('expectedUnit', [[meter], [second]]);
  },
  if: (build, build2, build3, buildOut) => {
    expect(
      callBuiltinFunctor(
        'if',
        build({ type: 'boolean' }),
        build2({ type: 'number' }),
        build3({ type: 'number' })
      )
    ).toEqual(buildOut({ type: 'number' }));

    expect(
      callBuiltinFunctor(
        'if',
        build({ type: 'boolean' }),
        build2({ type: 'string' }),
        build3({ type: 'number' })
      ).errorCause
    ).not.toBeNull();
  },
};

for (const [testName, testFn] of Object.entries(typeDimTests)) {
  const buildScalar = (args: ExtendArgs) => Type.build(args);
  const build1D = (args: ExtendArgs) => Type.buildColumn(buildScalar(args), 42);
  const build2D = (args: ExtendArgs) => Type.buildColumn(build1D(args), 42);
  const build3D = (args: ExtendArgs) => Type.buildColumn(build2D(args), 42);

  it(`${testName} - Scalar`, () => {
    testFn(buildScalar, buildScalar, buildScalar, buildScalar);
  });

  it(`${testName} - 1D`, () => {
    testFn(build1D, build1D, build1D, build1D);
  });

  it(`${testName} - Scalar mixed with 1D`, () => {
    testFn(buildScalar, build1D, build1D, build1D);
  });

  it(`${testName} - 2D`, () => {
    testFn(build2D, build2D, build2D, build2D);
  });

  it(`${testName} - Scalar mixed with 2D`, () => {
    testFn(buildScalar, build2D, build2D, build2D);
  });

  it(`${testName} - Scalar mixed with 3D`, () => {
    testFn(buildScalar, build3D, build3D, build3D);
  });

  it(`${testName} - 1D mixed with 3D`, () => {
    testFn(build1D, build3D, build3D, build3D);
  });
}
