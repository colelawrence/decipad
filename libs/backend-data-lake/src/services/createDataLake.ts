/* eslint-disable no-console */
import tables from '@decipad/tables';
import { notFound } from '@hapi/boom';
import { dataLakeId } from '../utils/dataLakeId';
import { googleBigQueryRootClient } from '../utils/googleBigQueryRootClient';
import { googleIamRootClient } from '../utils/googleIamClient';
import { parseBigQueryCredentials } from '../utils/parseBigQueryCredentials';
import { encodeBigQueryCredentials } from '../utils/encodeBigQueryCredentials';
import { timeout } from '@decipad/utils';

export const createDataLake = async ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  console.log('createDataLake', { workspaceId });
  // check if the workspace exists
  const data = await tables();
  const workspace = await data.workspaces.get({ id: workspaceId });
  if (!workspace) {
    throw notFound('Workspace not found');
  }

  const dataSetId = dataLakeId(workspaceId);
  const dataLakeRecord = await data.datalakes.get({ id: dataSetId });
  if (!dataLakeRecord) {
    // create the data lake
    await data.datalakes.put({
      id: dataSetId,
      _version: 0,
      state: 'pending',
    });
  }

  // create data set for data lake
  const bqClient = googleBigQueryRootClient();
  try {
    await bqClient.createDataset(dataSetId);
  } catch (err) {
    if (
      !(
        err instanceof Error &&
        err.message.toLowerCase().includes('already exists')
      )
    ) {
      throw err;
    }
    console.warn('dataset already exists', dataSetId);
  }

  console.warn('created dataset in BQ', dataSetId);

  // create Google Cloud service account
  const iamClient = googleIamRootClient();
  const iamServiceAcount = await iamClient.createServiceAccount(workspaceId);
  console.warn('created service account', iamServiceAcount);

  await timeout(2000);

  // create policy and binding for service account
  await iamClient.createServiceAccountPoliciesAndBindings(
    iamServiceAcount,
    dataSetId
  );
  console.warn('created policy and binding for service account');

  // create access key for service account
  const key = await iamClient.createServiceAccountKey(
    iamServiceAcount,
    dataLakeRecord?.credentials == null
  );
  console.warn('key:', key);

  const newDataLake = await data.datalakes.withLock(dataSetId, (rec) => ({
    ...rec,
    id: dataSetId,
    state: 'ready',
    ...('privateKeyData' in key
      ? {
          credentials: encodeBigQueryCredentials(
            parseBigQueryCredentials(key.privateKeyData, true)
          ),
        }
      : {}),
  }));
  console.warn('updated data lake record', newDataLake);
};
