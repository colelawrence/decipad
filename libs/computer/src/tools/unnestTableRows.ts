import {
  deserializeType,
  serializeType,
  linearizeType,
  materializeOneResult,
} from '@decipad/language';
import type { Result } from '@decipad/language';
import { getDefined, last } from '@decipad/utils';
import { map } from '@decipad/generator-utils';
import { getResultGenerator } from '../utils';
import { DimensionExplanation } from '../types';

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
export async function* unnestTableRows(
  r: DimensionExplanation[],
  result: Result.Result<'materialized-column'>
): AsyncIterable<ResultAndLabelInfo> {
  const scalarType = serializeType(
    getDefined(last(linearizeType(deserializeType(result.type))))
  );

  async function* recurseDimensions(
    dims: DimensionExplanation[],
    _deepValue: Result.OneResult,
    labelInfo: LabelInfo[] = []
  ): AsyncIterable<ResultAndLabelInfo> {
    const deepValue = await materializeOneResult(_deepValue);
    if (Array.isArray(deepValue) !== dims.length > 0) {
      console.error({ deepValue, dims });
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

    const gen = getResultGenerator(deepValue);
    let indexAtThisDimension = -1;
    for await (const itemAtThisDimension of gen()) {
      indexAtThisDimension += 1;
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

  const recursedDimensions = recurseDimensions(r, result.value);

  const resultAndLabelInfoWithIndexesOfRemainingLengthsAreZero = map(
    recursedDimensions,
    (resultAndLabelInfo) => {
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
    }
  );

  yield* resultAndLabelInfoWithIndexesOfRemainingLengthsAreZero;
}
