import { DataSource } from '../types';

export const getConnectionName = (
  workspaceId: string,
  sourceType: DataSource
) => {
  return `c_${workspaceId}_${sourceType}`;
};
