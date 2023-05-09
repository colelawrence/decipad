/* eslint-disable @typescript-eslint/no-misused-promises */
import { N } from '@decipad/number';
import { PromiseOrType } from '@decipad/utils';
import { makeContext } from '..';
import { Type, buildType as t, Unit } from '../type';

import { callBuiltinFunctor } from './callBuiltinFunctor';
import { U } from '../utils';

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
  it('dateCmpFunctor', async () => {
    expect(
      await callBuiltinFunctor(nilCtx, '==', [t.date('month'), t.date('month')])
    ).toEqual(t.boolean());

    expect(
      (await callBuiltinFunctor(nilCtx, '>=', [t.date('day'), t.date('month')]))
        .errorCause
    ).not.toBeNull();
  });

  it('contains', async () => {
    expect(
      await callBuiltinFunctor(nilCtx, 'contains', [
        t.range(t.number([meter])),
        t.number(),
      ])
    ).toEqual(t.boolean());

    expect(
      await callBuiltinFunctor(nilCtx, 'contains', [
        t.range(t.number([meter])),
        t.number([meter]),
      ])
    ).toEqual(t.boolean());

    expect(
      await callBuiltinFunctor(nilCtx, 'contains', [
        t.column(t.range(t.number([meter]))),
        t.number([meter]),
      ])
    ).toEqual(t.column(t.boolean()));

    expect(
      await callBuiltinFunctor(nilCtx, 'contains', [
        t.range(t.number([meter])),
        t.column(t.number([meter])),
      ])
    ).toEqual(t.column(t.boolean()));

    expect(
      (
        await callBuiltinFunctor(nilCtx, 'contains', [
          t.range(t.number([meter])),
          t.number([second]),
        ])
      ).errorCause
    ).not.toBeNull();

    expect(
      await callBuiltinFunctor(nilCtx, 'contains', [
        t.date('month'),
        t.date('day'),
      ])
    ).toEqual(t.boolean());

    expect(
      (
        await callBuiltinFunctor(nilCtx, 'contains', [
          t.number([meter]),
          t.range(t.number([meter])),
        ])
      ).errorCause
    ).not.toBeNull();
  });

  it('cat', async () => {
    expect(
      await callBuiltinFunctor(nilCtx, 'cat', [
        t.column(t.number([meter])),
        t.column(t.number([meter])),
      ])
    ).toEqual(t.column(t.number([meter])));
  });

  it('first', async () => {
    expect(
      await callBuiltinFunctor(nilCtx, 'first', [t.column(t.number([meter]))])
    ).toEqual(t.number([meter]));
  });

  it('last', async () => {
    expect(
      await callBuiltinFunctor(nilCtx, 'last', [t.column(t.number([meter]))])
    ).toEqual(t.number([meter]));
  });

  it('errors', async () => {
    expect(
      (await callBuiltinFunctor(nilCtx, 'unknownFn', [t.number()])).errorCause
    ).not.toBeNull();

    expect(
      (await callBuiltinFunctor(nilCtx, 'if', [t.number()])).errorCause
    ).not.toBeNull();
  });
});

interface TestBuilderArgs {
  type: 'string' | 'boolean' | 'number' | 'month' | 'year';
  unit?: Unit[] | null;
}
type Builder = (a: TestBuilderArgs) => PromiseOrType<Type>;
// build, build2, build3, and buildOut will switch dimensionality to test propagation
type Test = (
  build: Builder,
  build2: Builder,
  build3: Builder,
  buildOut: Builder
) => PromiseOrType<void>;

const typeDimTests: Record<string, Test> = {
  binopFunctor: async (build, build2, _, buildOut) => {
    const n = await build({ type: 'number' });
    const n2 = await build2({ type: 'number' });
    const out = await buildOut({ type: 'number' });

    expect(await callBuiltinFunctor(nilCtx, '+', [n, n2])).toEqual(out);
  },
  cmpFunctor: async (build, build2, _, buildOut) => {
    const n = await build({ type: 'number' });
    const n2 = await build2({ type: 'number' });
    const out = await buildOut({ type: 'boolean' });

    expect(await callBuiltinFunctor(nilCtx, '>', [n, n2])).toEqual(out);

    expect(
      await callBuiltinFunctor(nilCtx, '>', [
        await build({ type: 'number', unit: [meter] }),
        await build2({ type: 'number', unit: [meter] }),
      ])
    ).toEqual(out);

    expect(
      await callBuiltinFunctor(nilCtx, '>', [
        await build({ type: 'number', unit: [meter] }),
        await build2({ type: 'number', unit: null }),
      ])
    ).toEqual(out);

    expect(
      (
        await callBuiltinFunctor(nilCtx, '>', [
          await build({ type: 'number', unit: [meter] }),
          await build2({ type: 'number', unit: [second] }),
        ])
      ).errorCause?.spec
    ).toHaveProperty('expectedUnit', [[meter], [second]]);
  },
  if: async (build, build2, build3, buildOut) => {
    expect(
      await callBuiltinFunctor(nilCtx, 'if', [
        await build({ type: 'boolean' }),
        await build2({ type: 'number' }),
        await build3({ type: 'number' }),
      ])
    ).toEqual(buildOut({ type: 'number' }));

    expect(
      (
        await callBuiltinFunctor(nilCtx, 'if', [
          await build({ type: 'boolean' }),
          await build2({ type: 'string' }),
          await build3({ type: 'number' }),
        ])
      ).errorCause
    ).not.toBeNull();
  },
  '+': async (build, build2, _, buildOut) => {
    expect(
      await callBuiltinFunctor(nilCtx, '+', [
        await build({ type: 'number' }),
        await build2({ type: 'number' }),
      ])
    ).toEqual(buildOut({ type: 'number' }));

    expect(
      await callBuiltinFunctor(nilCtx, '+', [
        await build({ type: 'month' }),
        await build2({ type: 'number', unit: U('month') }),
      ])
    ).toEqual(buildOut({ type: 'month' }));

    expect(
      await callBuiltinFunctor(nilCtx, '+', [
        await build2({ type: 'number', unit: U('month') }),
        await build({ type: 'month' }),
      ])
    ).toEqual(buildOut({ type: 'month' }));
  },
  '-': async (build, build2, _, buildOut) => {
    expect(
      await callBuiltinFunctor(nilCtx, '-', [
        await build({ type: 'number' }),
        await build2({ type: 'number' }),
      ])
    ).toEqual(buildOut({ type: 'number' }));

    expect(
      await callBuiltinFunctor(nilCtx, '-', [
        await build({ type: 'month' }),
        await build2({ type: 'number', unit: U('month') }),
      ])
    ).toEqual(buildOut({ type: 'month' }));

    expect(
      (
        await callBuiltinFunctor(nilCtx, '-', [
          await build2({ type: 'number', unit: U('month') }),
          await build({ type: 'month' }),
        ])
      ).errorCause
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
  const build1D = (args: TestBuilderArgs) => t.column(buildScalar(args));
  const build2D = (args: TestBuilderArgs) => t.column(build1D(args));
  const build3D = (args: TestBuilderArgs) => t.column(build2D(args));

  // eslint-disable-next-line jest/valid-title
  describe(testName, () => {
    /* eslint-disable jest/expect-expect */
    it(`${testName} - Scalar`, async () => {
      await testFn(buildScalar, buildScalar, buildScalar, buildScalar);
    });

    it(`${testName} - 1D`, async () => {
      await testFn(build1D, build1D, build1D, build1D);
    });

    it(`${testName} - Scalar mixed with 1D`, async () => {
      await testFn(buildScalar, build1D, build1D, build1D);
    });

    it(`${testName} - 2D`, async () => {
      await testFn(build2D, build2D, build2D, build2D);
    });

    it(`${testName} - Scalar mixed with 2D`, async () => {
      await testFn(buildScalar, build2D, build2D, build2D);
    });

    it(`${testName} - Scalar mixed with 3D`, async () => {
      await testFn(buildScalar, build3D, build3D, build3D);
    });

    it(`${testName} - 1D mixed with 3D`, async () => {
      await testFn(build1D, build3D, build3D, build3D);
    });
    /* eslint-enable jest/expect-expect */
  });
}
