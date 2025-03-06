import { datalake } from '@decipad/backend-config';
import { BigQuery } from '@google-cloud/bigquery';

export const googleBigQueryRootClient = () =>
  new BigQuery({ credentials: datalake().rootCredentials, location: 'EU' });
