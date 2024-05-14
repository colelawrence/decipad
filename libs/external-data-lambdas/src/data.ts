import type {
  ExternalDataSourceRecord,
  ExternalKeyRecord,
  Handler,
} from '@decipad/backendtypes';
import { provider as externalDataProvider } from '@decipad/externaldata';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import fetch from 'isomorphic-fetch';
import { checkNotebookOrWorkspaceAccess } from './checkAccess';
import { debug } from './debug';

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
  method?: string
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
  debug(`proxying ${reqUrl}`, { headers: reqHeaders });

  const resp = await fetch(reqUrl, { method, headers: reqHeaders });

  if (resp == null) {
    throw Boom.internal();
  }

  const body = Buffer.from(await resp.arrayBuffer());
  debug(
    'response from %s: %s',
    url ?? dataSource.externalId,
    body.toString('utf-8')
  );

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

  const externalDataSource = await fetchExternalDataSource(
    externalDataSourceId
  );
  if (!externalDataSource) {
    return {
      statusCode: 404,
      body: 'No such data source',
    };
  }

  await checkNotebookOrWorkspaceAccess({
    workspaceId: externalDataSource.workspace_id,
    notebookId: externalDataSource.padId,
    event,
  });

  const key = await getAccessKey(externalDataSource);
  if (!key) {
    throw Boom.forbidden('Needs authentication');
  }

  const url = event.queryStringParameters?.url;
  const method = event.queryStringParameters?.method;

  return proxy(externalDataSource, key, url, method);
};
