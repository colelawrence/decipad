import type { SerializedType, SerializedTypes } from '..';

const tableColumnTypes = new Set(['column', 'materialized-column']);

export const isTableColumn = (
  type: SerializedType | undefined
): type is SerializedTypes.Table | SerializedTypes.MaterializedTable =>
  tableColumnTypes.has(type?.kind as string);
