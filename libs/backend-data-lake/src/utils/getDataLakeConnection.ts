import { notAcceptable, notFound } from '@hapi/boom';
import tables from '@decipad/tables';
import { BigQuery } from '@google-cloud/bigquery';
import { datalake as datalakeConfig } from '@decipad/backend-config';
import { getDefined } from '@decipad/utils';
import { dataLakeId } from './dataLakeId';
import { parseBigQueryCredentials } from './parseBigQueryCredentials';
import { fakeFullDatalakeRecord } from '../routes/fakeFullDatalakeRecord';

export const getDataLakeConnection = async (workspaceId: string) => {
  const data = await tables();
  const overrideWorkspaceId = process.env.DATALAKE_OVERRIDE_DECI_WORKSPACE_ID;
  const effectiveWorkspaceId = overrideWorkspaceId ?? workspaceId;
  const dataSetId = dataLakeId(effectiveWorkspaceId);
  const lake = overrideWorkspaceId
    ? fakeFullDatalakeRecord(effectiveWorkspaceId)
    : await data.datalakes.get({ id: dataSetId });
  if (!lake) {
    throw notFound(`Data lake for workspace ${workspaceId} not found`);
  }
  if (lake.state !== 'ready') {
    throw notAcceptable(`Data lake for workspace ${workspaceId} is not ready`);
  }
  return new BigQuery({
    credentials: parseBigQueryCredentials(getDefined(lake.credentials), true),
    projectId: datalakeConfig().rootCredentials.project_id,
  });
};
