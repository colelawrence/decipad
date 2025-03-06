import { dataLakeId } from './dataLakeId';
import { getBigQueryProjectId } from './getBigQueryProjectId';

export const getBigQueryTableNamePrefix = (workspaceId: string) => {
  return `${getBigQueryProjectId()}.${dataLakeId(workspaceId)}`;
};
