import {
  SerializedType,
  SerializedTypes,
  isColumn,
  isTable,
} from '@decipad/computer';

type TabularType =
  | SerializedTypes.Column
  | SerializedTypes.MaterializedColumn
  | SerializedTypes.Table
  | SerializedTypes.MaterializedTable
  | SerializedTypes.Row;

export function isTabularType(
  type: SerializedType | undefined
): type is TabularType {
  return (
    type != null && (isColumn(type) || type.kind === 'row' || isTable(type))
  );
}
