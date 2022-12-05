import {
  deserializeType,
  Result,
  serializeType,
  linearizeType,
} from '@decipad/language';
import { OneResult } from 'libs/language/src/result';
import { enumerate, getDefined, last } from '@decipad/utils';
import { DimensionExplanation } from '../computer/Computer';

export type LabelInfo = {
  indexName?: string;
  label?: string;
  indexAtThisDimension: number;
  lengthAtThisDimension: number;
  productOfRemainingLengths?: number;
  indexesOfRemainingLengthsAreZero?: boolean;
};

export type ResultAndLabelInfo = {
  result: Result.Result;
  labelInfo: LabelInfo[];
};

/**
 * Un-nests the rows table structure, while providing labels to use in each row.
 *
 * Get a `DimensionExplanation` from `computer.explainDimensions$` so you can observe changes to dimension labels and lengths.
 */
export function* unnestTableRows(
  r: DimensionExplanation[],
  result: Result.Result<'column'>
): Iterable<ResultAndLabelInfo> {
  const scalarType = serializeType(
    getDefined(last(linearizeType(deserializeType(result.type))))
  );

  function* recurseDimensions(
    dims: DimensionExplanation[],
    deepValue: OneResult,
    labelInfo: LabelInfo[] = []
  ): Iterable<ResultAndLabelInfo> {
    if (Array.isArray(deepValue) !== dims.length > 0) {
      throw new Error('panic: DimensionExplanation does not match reality');
    }

    if (dims.length === 0) {
      yield {
        labelInfo,
        result: { type: scalarType, value: deepValue },
      };
      return;
    }

    const [dimHere, ...restDims] = dims;

    for (const [indexAtThisDimension, itemAtThisDimension] of enumerate(
      deepValue as OneResult[]
    )) {
      const labelInfoHere: LabelInfo = {
        indexName: dimHere.indexedBy,
        label: dimHere.labels?.[indexAtThisDimension],
        indexAtThisDimension,
        lengthAtThisDimension: dimHere.dimensionLength,
      };
      yield* recurseDimensions(restDims, itemAtThisDimension, [
        ...labelInfo,
        labelInfoHere,
      ]);
    }
  }

  const recursedDimensions = [...recurseDimensions(r, result.value)];

  const resultAndLabelInfoWithIndexesOfRemainingLengthsAreZero =
    recursedDimensions.map((resultAndLabelInfo) => {
      const mappedLabelInfo = resultAndLabelInfo.labelInfo.map(
        (labelInfo, labelInfoIndex) => {
          const restLabelInfo = resultAndLabelInfo.labelInfo.slice(
            labelInfoIndex + 1
          );

          const indexesOfRemainingLengthsAreZero = restLabelInfo.every(
            ({ indexAtThisDimension }) => indexAtThisDimension === 0
          );
          const productOfRemainingLengths = restLabelInfo.reduce(
            (acc, { lengthAtThisDimension }) => acc * lengthAtThisDimension,
            1
          );

          return {
            ...labelInfo,
            indexesOfRemainingLengthsAreZero,
            productOfRemainingLengths,
          };
        }
      );

      return {
        result: resultAndLabelInfo.result,
        labelInfo: mappedLabelInfo,
      };
    });

  yield* resultAndLabelInfoWithIndexesOfRemainingLengthsAreZero;
}
