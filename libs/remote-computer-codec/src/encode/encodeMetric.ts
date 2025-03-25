import type { Result, SerializedType } from '@decipad/language-interfaces';
import type { RecursiveEncoder } from './types';
import { encodeTable } from './encodeTable';

export const encodeMetric = async (
  result: Result.Result,
  buffer: DataView,
  offset: number,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
): Promise<number> => {
  const { type, value, meta } = result;
  if (type.kind !== 'metric') {
    throw new TypeError('Metric: Expected metric type');
  }
  // we piggyback on the table encoder for now
  return encodeTable(
    {
      type: {
        kind: 'table',
        columnNames: ['date', 'value'],
        columnTypes: [{ kind: 'date', date: type.granularity }, type.valueType],
        indexName: null,
        delegatesIndexTo: null,
      } satisfies SerializedType,
      value,
      meta,
    },
    buffer,
    offset,
    encoders
  );
};
