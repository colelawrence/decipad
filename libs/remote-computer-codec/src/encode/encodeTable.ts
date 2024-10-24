import type { Result, SerializedType } from '@decipad/language-interfaces';
import type { RecursiveEncoder } from './types';

export const encodeTable = async (
  result: Result.Result,
  buffer: DataView,
  _offset: number,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
): Promise<number> => {
  const { type, value, meta } = result;
  if (type.kind !== 'table' && type.kind !== 'materialized-table') {
    // eslint-disable-next-line no-console
    console.warn('Unexpected type', type);
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
      {
        type: {
          kind: encoderType,
          cellType: colType,
          indexedBy: null,
          atParentIndex: colIndex,
        } satisfies SerializedType,
        value: col,
        meta,
      },
      buffer,
      offset,
      encoders
    );
  }

  return offset;
};
