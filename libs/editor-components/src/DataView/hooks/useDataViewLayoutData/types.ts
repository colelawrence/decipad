import type {
  Result,
  SerializedType,
  Value,
} from '@decipad/language-interfaces';
import type { DataViewFilter } from '@decipad/editor-types';
import type { DataGroup } from '../../types';

export interface GenerateGroupsProps {
  tableName: string;
  tree: Result.Result<'tree'>;
  previousColumns: Array<Value.TreeColumn>;
  previousColumnTypes: Array<SerializedType>;
  previousFilters: Array<DataViewFilter | undefined>;
  valuePath: Array<Result.OneResult>;
  aggregations: Array<string | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
  parentGroupId?: string;
  preventExpansion: boolean;
  indent?: number;
  expandedGroups?: string[] | boolean;
}

export type GenerateGroups = (
  props: GenerateGroupsProps
) => Promise<DataGroup[]>;
