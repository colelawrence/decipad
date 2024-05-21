import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  deserializeType,
  serializeType,
  Dimension,
  getResultGenerator,
} from '@decipad/language';
import { getDefined, last } from '@decipad/utils';
import { map } from '@decipad/generator-utils';
import type {
  DimensionExplanation,
  LabelInfo,
  ResultAndLabelInfo,
} from '@decipad/computer-interfaces';

/**
 * Un-nests the rows table structure, while providing labels to use in each row.
 *
 * Get a `DimensionExplanation` from `computer.explainDimensions$` so you can observe changes to dimension labels and lengths.
 */
export async function* unnestTableRows(
  r: DimensionExplanation[],
  result: Result.Result<'materialized-column'> | Result.Result<'column'>
): AsyncGenerator<ResultAndLabelInfo> {
  const scalarType = serializeType(
    getDefined(last(Dimension.linearizeType(deserializeType(result.type))))
  );

  async function* recurseDimensions(
    dims: DimensionExplanation[],
    deepValue: Result.OneResult,
    labelInfo: LabelInfo[] = []
  ): AsyncGenerator<ResultAndLabelInfo> {
    if (dims.length === 0) {
      yield {
        labelInfo,
        result: {
          type: scalarType,
          value: deepValue as Result.OneResult,
        } as Result.Result,
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
