import { RecursiveEncoder } from './types';
// eslint-disable-next-line no-restricted-imports
import { getResultGenerator, Value } from '@decipad/language-types';

export const recursiveEncodeColumn: RecursiveEncoder = (
  type,
  buffer,
  value,
  offset,
  encoders
) => {
  if (type.kind !== 'column' && type.kind !== 'materialized-column') {
    throw new TypeError('Column: Expected column or materialized-column type');
  }
  const gen = getResultGenerator(value);
  const colValue = Value.LeanColumn.fromGeneratorAndType(
    gen,
    type,
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
    return encoder(cellType, subBuffer, subValue, subOffset, encoders);
  };
  const col = new Value.WriteSerializedColumn(cellEncoder, colValue);
  return col.serialize(buffer, offset);
};
