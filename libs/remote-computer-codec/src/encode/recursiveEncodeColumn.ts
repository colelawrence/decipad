import { Result } from '@decipad/language-interfaces';
import { RecursiveEncoder } from './types';
// eslint-disable-next-line no-restricted-imports
import { getResultGenerator, Value } from '@decipad/language-types';

export const recursiveEncodeColumn: RecursiveEncoder = (
  result,
  buffer,
  offset,
  encoders
) => {
  const { type, value, meta } = result;
  if (type.kind !== 'column' && type.kind !== 'materialized-column') {
    throw new TypeError('Column: Expected column or materialized-column type');
  }
  const gen = getResultGenerator(value);
  const colValue = Value.LeanColumn.fromGeneratorAndType(
    gen,
    type,
    meta as () => Result.ResultMetadataColumn,
    'valueEncoder'
  );
  const { cellType } = type;
  // eslint-disable-next-line no-use-before-define
  const encoder = encoders[cellType.kind];
  const cellEncoder: Value.WriteSerializedColumnEncoder = (
    subBuffer,
    subOffset,
    subValue
  ) => {
    return encoder(
      { type: cellType, value: subValue, meta: undefined },
      subBuffer,
      subOffset,
      encoders
    );
  };
  const col = new Value.WriteSerializedColumn(cellEncoder, colValue);
  return col.serialize(buffer, offset);
};
