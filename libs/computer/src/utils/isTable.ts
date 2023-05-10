import type { SerializedType, SerializedTypes } from '..';

const tableTypes = new Set(['table', 'materialized-table']);

export const isTable = (
  type: SerializedType | undefined
): type is SerializedTypes.Table | SerializedTypes.MaterializedTable =>
  tableTypes.has(type?.kind as string);
