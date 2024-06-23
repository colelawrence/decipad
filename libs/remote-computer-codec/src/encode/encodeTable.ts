import type { Result, SerializedType } from '@decipad/language-interfaces';
import type { RecursiveEncoder } from './types';

export const encodeTable = async (
  type: SerializedType,
  buffer: DataView,
  value: Result.OneResult,
  _offset: number,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
): Promise<number> => {
  if (type.kind !== 'table' && type.kind !== 'materialized-table') {
    throw new TypeError('Table: Expected table type');
  }
  let offset = _offset;
  if (!Array.isArray(value)) {
    throw new TypeError('Table: Expected array');
  }

  buffer.setUint32(offset, value.length);
  offset += 4;

  let colIndex = -1;
  for (const col of value) {
    colIndex += 1;
    const encoderType =
      typeof col === 'function' ? 'column' : 'materialized-column';
    const encoder = encoders[encoderType];
    const colType = type.columnTypes[colIndex];
    // eslint-disable-next-line no-await-in-loop
    offset = await encoder(
      { kind: encoderType, cellType: colType, indexedBy: null },
      buffer,
      col,
      offset,
      encoders
    );
  }

  return offset;
};
