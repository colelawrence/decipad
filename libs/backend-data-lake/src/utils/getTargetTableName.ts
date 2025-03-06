import { DataRealm } from '../types';
import { getBigQueryTableNamePrefix } from './getBigQueryTableNamePrefix';

export const getLocalTargetTableName = (realm: DataRealm, tableName: string) =>
  `${realm}_${tableName}`;

export const getTargetTableName = (
  workspaceId: string,
  realm: DataRealm,
  tableName: string
) => {
  return `${getBigQueryTableNamePrefix(workspaceId)}.${getLocalTargetTableName(
    realm,
    tableName
  )}`;
};
