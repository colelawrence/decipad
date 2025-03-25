import { SerializedType } from '@decipad/language-interfaces';
import type { RecursiveDecoder } from './types';
import { decodeTable } from './decodeTable';

export const decodeMetric: RecursiveDecoder = async (
  type,
  buffer,
  _offset,
  decoders
) => {
  const offset = _offset;
  if (type.kind !== 'metric') {
    throw new TypeError('Metric: Expected metric type');
  }

  // we piggyback on the table encoder for now
  return decodeTable(
    {
      kind: 'table',
      indexName: null,
      delegatesIndexTo: null,
      columnTypes: [
        { kind: 'date', date: type.granularity } satisfies SerializedType,
        type.valueType,
      ],
      columnNames: ['date', 'value'],
    },
    buffer,
    offset,
    decoders
  );
};
