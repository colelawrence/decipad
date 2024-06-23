/* eslint-disable jest/expect-expect */
import stringify from 'json-stringify-safe';
// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  Value,
  buildType,
  getResultGenerator,
  isErrorType,
  serializeType,
} from '@decipad/language-types';
import { all, slice } from '@decipad/generator-utils';
import type { DeciNumberBase } from '@decipad/number';
import DeciNumber, { N } from '@decipad/number';
import { getInstanceof } from '@decipad/utils';
import type { Result, Value as ValueTypes } from '@decipad/language-interfaces';
import { callBuiltin } from './callBuiltin';
import { U, makeContext } from './utils/testUtils';
import { callBuiltinFunctor } from './callBuiltinFunctor';
import type { BuiltinContextUtils } from './types';
import { toAsciiTable } from './testUtils/asciiTable';

interface TestSpec {
  name: string;
  cellCount: number;
  pageSize: number;
  args: ValueTypes.Value[];
  argTypes: Type[];
  builtInName: string;
}

interface TestResult {
  name: string;
  perfCall: number;
  perfMaterialize: number;
  returnType: Type;
  materializedResult: Result.OneResult[];
  resultRange: [number, number];
}

type SubTestDesc = [
  name: string,
  op: string,
  args: ValueTypes.Value[],
  argTypes: Type[],
  expects: (n: DeciNumberBase) => DeciNumberBase,
  expectedResultColumnCellCount?: number,
  slow?: boolean
];

const getReturnType = async (
  ctx: BuiltinContextUtils,
  fName: string,
  argTypes: Type[]
): Promise<Type> => {
  return callBuiltinFunctor(ctx, fName, argTypes, []);
};

describe('callBuiltin performance', () => {
  const allResults: TestResult[] = [];

  const runTest = async ({
    name,
    cellCount,
    pageSize,
    args,
    argTypes,
    builtInName,
  }: TestSpec): Promise<TestResult> => {
    console.log('Running test:', name);
    const ctx = makeContext();
    const returnType = await getReturnType(ctx, builtInName, argTypes);
    if (isErrorType(returnType)) {
      throw new Error(
        `Error return type from builtin: ${stringify(
          returnType.errorCause.spec,
          null,
          '\t'
        )}`
      );
    }
    console.log(
      'Return type:',
      stringify(serializeType(returnType), null, '\t')
    );

    // test speed ot calling the builtin
    let start = Date.now();
    const resultValue = await (
      await callBuiltin(ctx, builtInName, args, argTypes, returnType, [])
    ).getData();
    let end = Date.now();
    const elapsed1 = end - start;
    const perf1 = Math.round((cellCount / elapsed1) * 1000);

    // test speed of partial materialization
    expect(typeof resultValue).toBe('function');
    const from = Math.round(cellCount / 2);
    const to = from + pageSize;
    console.log('Materializing from', from, 'to', to, 'of', cellCount);
    start = Date.now();
    const materializedResult = await all(
      getResultGenerator(resultValue)(from, to)
    );
    end = Date.now();
    const elapsed2 = end - start;
    const perf2 = Math.round((cellCount / elapsed2) * 1000);
    expect(materializedResult).toBeInstanceOf(Array);
    expect(materializedResult).toHaveLength(pageSize);

    console.log('Finished test', name);

    const testResult: TestResult = {
      name,
      perfCall: perf1,
      perfMaterialize: perf2,
      returnType,
      materializedResult,
      resultRange: [from, to],
    };

    allResults.push(testResult);
    return testResult;
  };

  // TODO: we are also including in the tests the time it takes to generate the numbers, which slows down the results.
  const numberGen =
    (to: number) =>
    (innerFrom = 0, innerTo = Infinity) =>
      slice(
        (async function* numberGenGen() {
          for (let i = 0; i < to; i++) {
            yield N(i, 3); // divide by 3 to make this harder
          }
        })(),
        innerFrom,
        innerTo
      );

  const count = 10_000;
  const pageSize = 20;

  afterAll(() => {
    // present summary table

    if (allResults.length === 0) {
      console.log('No results');
      return;
    }
    console.log(
      toAsciiTable({
        name: 'Performance Summary',
        columnHeaders: [
          { name: 'Test' },
          { name: 'Call Perf' },
          { name: 'Materialize Perf' },
        ],
        rows: allResults.map((result) => ({
          cells: [
            result.name,
            `${result.perfCall.toLocaleString()} cells/s`,
            `${result.perfMaterialize.toLocaleString()} cells/s`,
          ],
        })),
      })
    );
  });

  const testThis = async (
    name: string,
    op: string,
    args: ValueTypes.Value[],
    argTypes: Type[],
    expects: (n: DeciNumberBase) => DeciNumberBase,
    expectedResultColumnCellCount = count,
    slow = false
  ) => {
    const { materializedResult, perfCall, perfMaterialize, resultRange } =
      await runTest({
        name,
        cellCount: expectedResultColumnCellCount,
        pageSize,
        args,
        argTypes,
        builtInName: op,
      });
    expect(resultRange[0]).toBeGreaterThan(0);
    expect(resultRange[1] - resultRange[0]).toBe(pageSize);

    console.log(`${op} Call performance:`, perfCall, 'cells per second');
    console.log(
      `${op} Materialize performance:`,
      perfMaterialize,
      'cells per second'
    );
    expect(perfCall).toBeGreaterThan(slow ? 50_000 : 100_000);
    expect(materializedResult).toHaveLength(pageSize);
    materializedResult.forEach((value, index) => {
      const numberValue = getInstanceof(value, DeciNumber);
      expect(numberValue.toString()).toEqual(
        expects(N(index + resultRange[0], 3)).toString()
      );
    });

    // very low minimum for shitty CI runtimes
    expect(perfMaterialize).toBeGreaterThanOrEqual(slow ? 500 : 5_000);
  };

  describe('column to scalar', () => {
    describe('unitless', () => {
      describe('addition', () => {
        test.each([
          [
            'add a number unitless column to a number',
            '+',
            [
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
              Value.Scalar.fromValue(N(10)),
            ],
            [buildType.column(buildType.number()), buildType.number()],
            (n) => n.add(N(10)),
          ],
          [
            'add a unitless number to a number column',
            '+',
            [
              Value.Scalar.fromValue(N(10)),
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
            ],
            [buildType.number(), buildType.column(buildType.number())],
            (n) => N(10).add(n),
          ],
        ] as Array<SubTestDesc>)('%s', testThis);
      });

      describe('subtraction', () => {
        test.each([
          [
            'subtract a number unitless column from a number',
            '-',
            [
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
              Value.Scalar.fromValue(N(10)),
            ],
            [buildType.column(buildType.number()), buildType.number()],
            (n) => n.sub(N(10)),
          ],
          [
            'subtract a unitless number from a number column',
            '-',
            [
              Value.Scalar.fromValue(N(10)),
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
            ],
            [buildType.number(), buildType.column(buildType.number())],
            (n) => N(10).sub(n),
          ],
        ] as Array<SubTestDesc>)('%s', testThis);
      });

      describe('multiplication', () => {
        test.each([
          [
            'multiply a number unitless column to a number',
            '*',
            [
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
              Value.Scalar.fromValue(N(10)),
            ],
            [buildType.column(buildType.number()), buildType.number()],
            (n) => n.mul(N(10)),
          ],
          [
            'multiply a unitless number to a number column',
            '*',
            [
              Value.Scalar.fromValue(N(10)),
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
            ],
            [buildType.number(), buildType.column(buildType.number())],
            (n) => N(10).mul(n),
          ],
        ] as Array<SubTestDesc>)('%s', testThis);
      });

      describe('division', () => {
        test.each([
          [
            'divide a number unitless column to a number',
            '/',
            [
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
              Value.Scalar.fromValue(N(10)),
            ],
            [buildType.column(buildType.number()), buildType.number()],
            (n) => n.div(N(10)),
          ],
          [
            'divide a unitless number to a number column',
            '/',
            [
              Value.Scalar.fromValue(N(10)),
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
            ],
            [buildType.number(), buildType.column(buildType.number())],
            (n) => N(10).div(n),
          ],
        ] as Array<SubTestDesc>)('%s', testThis);
      });
    });

    // TODO: make unitful conversions performant
    // eslint-disable-next-line jest/no-disabled-tests
    describe('unitful', () => {
      describe('addition', () => {
        test.each([
          [
            'add a unit number column to a unit number',
            '+',
            [
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
              Value.Scalar.fromValue(N(10)),
            ],
            [
              buildType.column(buildType.number(U('grams'))),
              buildType.number(U('pounds')),
            ],
            (n) => n.div(N(28_349_523_125, 1e9).mul(N(16))).add(N(10)),
            count,
            true, // TODO: make it not slow
          ],
        ] as Array<SubTestDesc>)('%s', testThis);
      });
    });
  });

  describe('column to column', () => {
    describe('unitless', () => {
      describe('addition', () => {
        test.each([
          [
            'add a unitless column to a unitless column',
            '+',
            [
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
            ],
            [
              buildType.column(buildType.number()),
              buildType.column(buildType.number()),
            ],
            (n) => n.add(n),
            count,
          ],
        ] as Array<SubTestDesc>)('%s', testThis);
      });
    });

    // TODO: make unitful conversions performant
    // eslint-disable-next-line jest/no-disabled-tests
    describe('unitful', () => {
      describe('addition', () => {
        test.each([
          [
            'add a unitful column to a unitful column',
            '+',
            [
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
              Value.LeanColumn.fromGeneratorAndType(numberGen(count), {
                kind: 'number',
              }),
            ],
            [
              buildType.column(buildType.number(U('grams'))),
              buildType.column(buildType.number(U('pounds'))),
            ],
            (n) => n.div(N(28_349_523_125, 1e9).mul(N(16))).add(n),
            count,
            true, // TODO: make this now slow
          ],
        ] as Array<SubTestDesc>)('%s', testThis);
      });
    });
  });
});
