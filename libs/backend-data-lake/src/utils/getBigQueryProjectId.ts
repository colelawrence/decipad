import { datalake } from '@decipad/backend-config';

export const getBigQueryProjectId = () => {
  return datalake().rootCredentials.project_id;
};
