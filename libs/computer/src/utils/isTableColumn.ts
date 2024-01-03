// eslint-disable-next-line no-restricted-imports
import type { SerializedType, SerializedTypes } from '@decipad/language';

const tableColumnTypes = new Set(['column', 'materialized-column']);

export const isTableColumn = (
  type: SerializedType | undefined
): type is SerializedTypes.Table | SerializedTypes.MaterializedTable =>
  tableColumnTypes.has(type?.kind as string);
