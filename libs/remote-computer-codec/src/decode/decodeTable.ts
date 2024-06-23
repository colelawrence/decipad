import { Result } from '@decipad/language-interfaces';
import { RecursiveDecoder } from './types';

export const decodeTable: RecursiveDecoder = async (
  type,
  buffer,
  _offset,
  decoders
) => {
  if (type.kind !== 'table' && type.kind !== 'materialized-table') {
    throw new TypeError('Table: Expected table type');
  }
  let offset = _offset;

  const colLength = buffer.getUint32(offset);
  offset += 4;
  const columns: Result.OneResult[] = [];

  for (let colIndex = 0; colIndex < colLength; colIndex += 1) {
    const colType = type.columnTypes[colIndex];
    const decoder = decoders['materialized-column'];
    // eslint-disable-next-line no-await-in-loop
    const [col, newOffset] = await decoder(
      { kind: 'materialized-column', cellType: colType, indexedBy: null },
      buffer,
      offset,
      decoders
    );
    offset = newOffset;
    columns.push(col);
  }

  return [columns, offset];
};
