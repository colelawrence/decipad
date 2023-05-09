import type { SerializedType, SerializedTypes } from '..';

const columnTypes = new Set(['column', 'materialized-column']);

export const isColumn = (
  type: SerializedType | undefined
): type is SerializedTypes.Column | SerializedTypes.MaterializedColumn => {
  return columnTypes.has(type?.kind as string);
};
