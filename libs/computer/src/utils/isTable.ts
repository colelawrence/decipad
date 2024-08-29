import type {
  SerializedType,
  SerializedTypes,
} from '@decipad/language-interfaces';

export const isTable = (
  type: SerializedType | undefined
): type is SerializedTypes.Table | SerializedTypes.MaterializedTable =>
  isTableKind(type?.kind);

export const isTableKind = (
  kind: SerializedType['kind'] | undefined
): boolean => kind === 'table' || kind === 'materialized-table';
