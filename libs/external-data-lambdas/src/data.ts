/* eslint-disable no-console */
import type {
  ExternalDataSourceRecord,
  ExternalKeyRecord,
  Handler,
} from '@decipad/backendtypes';
import {
  provider as externalDataProvider,
  renewKey,
} from '@decipad/externaldata';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import fetch from 'isomorphic-fetch';
import {
  checkNotebookAccess,
  checkNotebookAccessNoPublic,
  checkWorkspaceAccess,
} from './checkAccess';
import { externaldata } from '@decipad/services';
import { PublishedVersionName } from '@decipad/interfaces';

const fetchExternalDataSource = async (
  id: string
): Promise<ExternalDataSourceRecord | undefined> => {
  const data = await tables();
  return data.externaldatasources.get({ id });
};

const byLastError = (a: ExternalKeyRecord, b: ExternalKeyRecord) => {
  return (a.lastError ? 1 : 0) - (b.lastError ? 1 : 0);
};

const getAccessKey = async (
  externalDataSource: ExternalDataSourceRecord
): Promise<ExternalKeyRecord | undefined> => {
  const data = await tables();
  const keys = (
    await data.externaldatasourcekeys.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': externalDataSource.id,
      },
    })
  ).Items;

  return keys.sort(byLastError)[0];
};

const markKeyAsErrored = async (key: ExternalKeyRecord, error: string) => {
  const data = await tables();
  // eslint-disable-next-line no-param-reassign
  key.lastError = error;
  await data.externaldatasourcekeys.put(key);
};

// ---------------------------------------
// HTTP Methods
// ---------------------------------------

const proxy = async (
  dataSource: ExternalDataSourceRecord,
  key: ExternalKeyRecord,
  url?: string,
  method?: string,
  previousTryCount = 0
): Promise<APIGatewayProxyResultV2> => {
  const provider = getDefined(
    externalDataProvider(dataSource.provider),
    `no such provider: ${dataSource.provider}`
  );

  const reqHeaders: RequestInit['headers'] = {
    Authorization: `${key.token_type} ${key.access_token}`,
    ...(provider.dataHeaders ?? {}),
  };

  if (provider.type === 'notion' && url === 'getAllDatabases') {
    const notionSearchResults = await provider.getAllDatabases(reqHeaders);
    return {
      statusCode: 200,
      body: Buffer.from(JSON.stringify(notionSearchResults), 'utf-8').toString(
        'base64'
      ),
      isBase64Encoded: true,
    };
  }

  const reqUrl = url ?? dataSource.externalId;

  const resp = await fetch(reqUrl, { method, headers: reqHeaders });

  if (resp == null) {
    throw Boom.internal();
  }

  console.log('Response status:', resp.status, typeof resp.status);

  const body = Buffer.from(await resp.arrayBuffer());

  if (resp.status === 401 && previousTryCount < 1 && key.refresh_token) {
    console.log('going to renew key', key);
    const newKey = await renewKey(key, provider);
    if (newKey) {
      return proxy(dataSource, key, url, method, previousTryCount + 1);
    }
  } else {
    console.log('will not renew key', key);
  }

  if (resp.status >= 300) {
    await markKeyAsErrored(key, body.toString('utf-8'));
  }

  return {
    statusCode: resp.status,
    body: body.toString('base64'),
    isBase64Encoded: true,
  };
};

export const data: Handler = async (event) => {
  const externalDataSourceId = getDefined(getDefined(event.pathParameters).id);

  const providedPadId = event.queryStringParameters?.padId;
  const url = event.queryStringParameters?.url;
  const method = event.queryStringParameters?.method;

  const externalDataSource = await fetchExternalDataSource(
    externalDataSourceId
  );
  if (!externalDataSource) {
    return {
      statusCode: 404,
      body: 'No such data source',
    };
  }

  const key = await getAccessKey(externalDataSource);
  if (!key) {
    throw Boom.forbidden('Needs authentication');
  }

  const padId = externalDataSource.padId ?? providedPadId;

  const hasWorkspaceAccess = await checkWorkspaceAccess(
    externalDataSource.workspace_id!,
    event,
    'READ'
  )
    .then(() => true)
    .catch(() => false);

  if (hasWorkspaceAccess) {
    console.log('will proxy for external data source key', key, {
      url,
      method,
    });
    const response = await proxy(externalDataSource, key, url, method);
    if (typeof response !== 'object') {
      throw Boom.internal();
    }

    await externaldata.saveData(
      externalDataSource.id,
      url,
      Buffer.from(response.body!, 'base64')
    );

    return response;
  }

  if (padId == null) {
    throw Boom.badRequest('Could not find a PadID provided');
  }

  const hasNotebookAccess = await checkNotebookAccessNoPublic(
    padId,
    event,
    'READ'
  )
    .then(() => true)
    .catch(() => false);

  if (hasNotebookAccess) {
    const latestSnapshot = await externaldata.getLatestExternalDataSnapshot(
      externalDataSourceId,
      url
    );

    if (latestSnapshot == null) {
      throw Boom.badRequest('Could not find a data snapshot');
    }

    return {
      statusCode: 200,
      body: latestSnapshot.toString('base64'),
      isBase64Encoded: true,
    };
  }

  const hasPublicNotebookAccess = await checkNotebookAccess(
    padId,
    event,
    'READ'
  )
    .then(() => true)
    .catch(() => false);

  if (hasPublicNotebookAccess) {
    const dataTables = await tables();
    const snapshotRec = (
      await dataTables.docsyncsnapshots.query({
        IndexName: 'byDocsyncIdAndSnapshotName',
        KeyConditionExpression:
          'docsync_id = :docsyncId and snapshotName = :snapshotName',
        ExpressionAttributeValues: {
          ':docsyncId': padId,
          ':snapshotName': PublishedVersionName.Published,
        },
      })
    ).Items[0];

    const latestSnapshot =
      await externaldata.getLatestExternalDataSnapshotWithPublish(
        externalDataSourceId,
        url,
        snapshotRec.id
      );

    if (latestSnapshot == null) {
      throw Boom.badRequest('Could not find a data snapshot');
    }

    return {
      statusCode: 200,
      body: latestSnapshot.toString('base64'),
      isBase64Encoded: true,
    };
  }

  throw Boom.unauthorized();
};
