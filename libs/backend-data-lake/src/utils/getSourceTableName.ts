import { DataRealm, DataSource } from '../types';
import { getBigQueryTableNamePrefix } from './getBigQueryTableNamePrefix';

export const getLocalSourceTableName = (
  realm: DataRealm,
  source: DataSource,
  tableName: string
) => `${realm}_${source}_${tableName}`;

export const getSourceTableName = (
  workspaceId: string,
  realm: DataRealm,
  source: DataSource,
  entityName: string
) => {
  return `${getBigQueryTableNamePrefix(workspaceId)}.${getLocalSourceTableName(
    realm,
    source,
    entityName
  )}`;
};
