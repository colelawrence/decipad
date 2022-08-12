import Fraction, { F } from '@decipad/fraction';
import { Result } from '@decipad/computer';
import { unzip } from '@decipad/utils';
import { Aggregator } from '../types';

const { ResultTransforms, Column } = Result;

type RankResult<T> = RankEntry<T>[];
type RankEntry<T> = [T, number];
type Slice = [number, number];

function byReverseSliceSize(
  [aStart, aEnd]: Slice,
  [bStart, bEnd]: Slice
): number {
  const aSliceLength = aEnd - aStart;
  const bSliceLength = bEnd - bStart;
  return bSliceLength - aSliceLength;
}

function rank<T>(input: Array<T>): RankResult<T> {
  const asColumn = Column.fromValues(input as Result.Comparable[]);
  const sortedColumn = ResultTransforms.sort(asColumn);
  const slicesMap = ResultTransforms.contiguousSlices(sortedColumn);
  const rankedSlicesMap = slicesMap.sort(byReverseSliceSize);
  return rankedSlicesMap.map(([start, end]) => [
    sortedColumn.atIndex(start) as T,
    end - start,
  ]);
}

function sortRankResult<T>(a: [T, number], b: [T, number]): number {
  return a[1] - b[1];
}

function rankEntryToFrequenciesResult<T>([value, freq]: RankEntry<T>): [
  T,
  Fraction
] {
  return [value, F(freq)];
}

function computeFrequencies<T>(input: Array<T>): [Array<T>, Array<Fraction>] {
  const rankResult = rank(input).sort(sortRankResult);
  return unzip(rankResult.map(rankEntryToFrequenciesResult));
}

export const frequency: Aggregator = (input) => {
  const frequencies = computeFrequencies(input.value.values);
  if (frequencies[0].length !== frequencies[1].length) {
    throw new Error(
      `frequency table columns have different lengths: ${frequencies[0].length} and ${frequencies[1].length}`
    );
  }
  return {
    type: {
      kind: 'table',
      columnNames: ['value', 'frequency'],
      columnTypes: [input.type, { kind: 'number', unit: null }],
      indexName: 'value',
      tableLength: frequencies[0].length,
    },
    value: frequencies as Result.Result<'table'>['value'],
  };
};
