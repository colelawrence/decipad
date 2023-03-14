import { N } from '@decipad/number';
import { makeContext } from '..';
import { Type, buildType as t, Unit } from '../type';
import { U } from '../utils';

import { callBuiltinFunctor } from './callBuiltinFunctor';

const meter: Unit = {
  unit: 'meter',
  exp: N(1),
  multiplier: N(1),
  known: true,
};

const second: Unit = {
  unit: 'second',
  exp: N(1),
  multiplier: N(1),
  known: true,
};

const nilCtx = makeContext();

describe('callBuiltin', () => {
  it('dateCmpFunctor', () => {
    expect(
      callBuiltinFunctor(nilCtx, '==', [t.date('month'), t.date('month')])
    ).toEqual(t.boolean());

    expect(
      callBuiltinFunctor(nilCtx, '>=', [t.date('day'), t.date('month')])
        .errorCause
    ).not.toBeNull();
  });

  it('contains', () => {
    expect(
      callBuiltinFunctor(nilCtx, 'contains', [
        t.range(t.number([meter])),
        t.number(),
      ])
    ).toEqual(t.boolean());

    expect(
      callBuiltinFunctor(nilCtx, 'contains', [
        t.range(t.number([meter])),
        t.number([meter]),
      ])
    ).toEqual(t.boolean());

    expect(
      callBuiltinFunctor(nilCtx, 'contains', [
        t.column(t.range(t.number([meter])), 3),
        t.number([meter]),
      ])
    ).toEqual(t.column(t.boolean(), 3));

    expect(
      callBuiltinFunctor(nilCtx, 'contains', [
        t.range(t.number([meter])),
        t.column(t.number([meter]), 3),
      ])
    ).toEqual(t.column(t.boolean(), 3));

    expect(
      callBuiltinFunctor(nilCtx, 'contains', [
        t.range(t.number([meter])),
        t.number([second]),
      ]).errorCause
    ).not.toBeNull();

    expect(
      callBuiltinFunctor(nilCtx, 'contains', [t.date('month'), t.date('day')])
    ).toEqual(t.boolean());

    expect(
      callBuiltinFunctor(nilCtx, 'contains', [
        t.number([meter]),
        t.range(t.number([meter])),
      ]).errorCause
    ).not.toBeNull();
  });

  it('cat', () => {
    expect(
      callBuiltinFunctor(nilCtx, 'cat', [
        t.column(t.number([meter]), 2),
        t.column(t.number([meter]), 3),
      ])
    ).toEqual(t.column(t.number([meter]), 5));
  });

  it('first', () => {
    expect(
      callBuiltinFunctor(nilCtx, 'first', [t.column(t.number([meter]), 3)])
    ).toEqual(t.number([meter]));
  });

  it('last', () => {
    expect(
      callBuiltinFunctor(nilCtx, 'last', [t.column(t.number([meter]), 3)])
    ).toEqual(t.number([meter]));
  });

  it('errors', () => {
    expect(
      callBuiltinFunctor(nilCtx, 'unknownFn', [t.number()]).errorCause
    ).not.toBeNull();

    expect(
      callBuiltinFunctor(nilCtx, 'if', [t.number()]).errorCause
    ).not.toBeNull();
  });
});

interface TestBuilderArgs {
  type: 'string' | 'boolean' | 'number' | 'month' | 'year';
  unit?: Unit[] | null;
}
type Builder = (a: TestBuilderArgs) => Type;
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

    expect(callBuiltinFunctor(nilCtx, '+', [n, n2])).toEqual(out);
  },
  cmpFunctor: (build, build2, _, buildOut) => {
    const n = build({ type: 'number' });
    const n2 = build2({ type: 'number' });
    const out = buildOut({ type: 'boolean' });

    expect(callBuiltinFunctor(nilCtx, '>', [n, n2])).toEqual(out);

    expect(
      callBuiltinFunctor(nilCtx, '>', [
        build({ type: 'number', unit: [meter] }),
        build2({ type: 'number', unit: [meter] }),
      ])
    ).toEqual(out);

    expect(
      callBuiltinFunctor(nilCtx, '>', [
        build({ type: 'number', unit: [meter] }),
        build2({ type: 'number', unit: null }),
      ])
    ).toEqual(out);

    expect(
      callBuiltinFunctor(nilCtx, '>', [
        build({ type: 'number', unit: [meter] }),
        build2({ type: 'number', unit: [second] }),
      ]).errorCause?.spec
    ).toHaveProperty('expectedUnit', [[meter], [second]]);
  },
  if: (build, build2, build3, buildOut) => {
    expect(
      callBuiltinFunctor(nilCtx, 'if', [
        build({ type: 'boolean' }),
        build2({ type: 'number' }),
        build3({ type: 'number' }),
      ])
    ).toEqual(buildOut({ type: 'number' }));

    expect(
      callBuiltinFunctor(nilCtx, 'if', [
        build({ type: 'boolean' }),
        build2({ type: 'string' }),
        build3({ type: 'number' }),
      ]).errorCause
    ).not.toBeNull();
  },
  '+': (build, build2, _, buildOut) => {
    expect(
      callBuiltinFunctor(nilCtx, '+', [
        build({ type: 'number' }),
        build2({ type: 'number' }),
      ])
    ).toEqual(buildOut({ type: 'number' }));

    expect(
      callBuiltinFunctor(nilCtx, '+', [
        build({ type: 'month' }),
        build2({ type: 'number', unit: U('month') }),
      ])
    ).toEqual(buildOut({ type: 'month' }));

    expect(
      callBuiltinFunctor(nilCtx, '+', [
        build2({ type: 'number', unit: U('month') }),
        build({ type: 'month' }),
      ])
    ).toEqual(buildOut({ type: 'month' }));
  },
  '-': (build, build2, _, buildOut) => {
    expect(
      callBuiltinFunctor(nilCtx, '-', [
        build({ type: 'number' }),
        build2({ type: 'number' }),
      ])
    ).toEqual(buildOut({ type: 'number' }));

    expect(
      callBuiltinFunctor(nilCtx, '-', [
        build({ type: 'month' }),
        build2({ type: 'number', unit: U('month') }),
      ])
    ).toEqual(buildOut({ type: 'month' }));

    expect(
      callBuiltinFunctor(nilCtx, '-', [
        build2({ type: 'number', unit: U('month') }),
        build({ type: 'month' }),
      ]).errorCause
    ).not.toBeNull();
  },
};

for (const [testName, testFn] of Object.entries(typeDimTests)) {
  const buildScalar = ({ type, unit }: TestBuilderArgs) => {
    if (type === 'number') {
      return t.number(unit);
    } else if (type === 'month' || type === 'year') {
      return t.date(type);
    } else {
      return t[type]();
    }
  };
  const build1D = (args: TestBuilderArgs) => t.column(buildScalar(args), 42);
  const build2D = (args: TestBuilderArgs) => t.column(build1D(args), 42);
  const build3D = (args: TestBuilderArgs) => t.column(build2D(args), 42);

  /* eslint-disable jest/expect-expect */
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
  /* eslint-enable jest/expect-expect */
}
