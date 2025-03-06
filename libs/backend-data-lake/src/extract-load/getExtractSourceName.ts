import { DataSource } from '../types';

export const getExtractSourceName = (
  workspaceId: string,
  sourceType: DataSource
) => {
  return `s_${workspaceId}_${sourceType}`;
};
