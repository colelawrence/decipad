import type {
  Result,
  SerializedType,
  Value,
} from '@decipad/language-interfaces';
import type { TimeSeriesFilter } from '@decipad/editor-types';
import type { DataGroup } from '../../types';

export interface GenerateGroupsProps {
  tableName: string;
  tree: Result.Result<'tree'>;
  previousColumns: Array<Value.TreeColumn>;
  previousColumnTypes: Array<SerializedType>;
  previousFilters: Array<TimeSeriesFilter | undefined>;
  valuePath: Array<Result.OneResult>;
  aggregations: Array<string | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<TimeSeriesFilter | undefined>;
  parentGroupId?: string;
  preventExpansion: boolean;
  indent?: number;
  expandedGroups?: string[];
}

export type GenerateGroups = (
  props: GenerateGroupsProps
) => Promise<DataGroup[]>;
