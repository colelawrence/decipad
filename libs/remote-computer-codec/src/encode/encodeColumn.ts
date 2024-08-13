import type { Result, Value as ValueTypes } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value, getResultGenerator } from '@decipad/language-types';
import { valueEncoder } from './valueEncoder';
import { initialBufferSize, maxBufferSize, pageSize } from '../defaultConfig';

export const encodeColumn = async (
  result: Result.Result,
  start: number,
  end: number
): Promise<ArrayBuffer> => {
  const { type, value, meta } = result;
  if (type.kind !== 'column' && type.kind !== 'materialized-column') {
    throw new TypeError(`Expected column-like type and got ${type.kind}`);
  }
  const colValue: ValueTypes.ColumnLikeValue =
    Value.LeanColumn.fromGeneratorAndType(
      getResultGenerator(value ?? Unknown),
      type,
      () => meta as Result.ResultMetadataColumn
    );
  const col = new Value.WriteSerializedColumn(
    valueEncoder(type.cellType),
    colValue
  );
  const targetBuffer = new Value.GrowableDataView(
    new ArrayBuffer(initialBufferSize, {
      maxByteLength: maxBufferSize,
    }),
    { pageSize }
  );
  const finalSize = await col.serialize(targetBuffer, 0, start, end);
  return targetBuffer.seal(finalSize);
};
