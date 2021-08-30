import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import {
  User,
  ExternalDataSourceRecord,
  ExternalKeyRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import { provider as getProvider, encodeTable } from '@decipad/externaldata';
import { getDefined } from '@decipad/utils';
import handle from '../handle';

async function checkAccess(
  user: User | null,
  externalDataSource: ExternalDataSourceRecord
): Promise<void | APIGatewayProxyResultV2> {
  if (!user) {
    return {
      statusCode: 401,
      body: 'Needs authentication',
    };
  }

  const resource = `/pads/${externalDataSource.padId}`;
  if (!(await isAuthorized(resource, user, 'READ'))) {
    return {
      statusCode: 403,
      body: 'Needs authorization',
    };
  }

  return undefined;
}

async function fetchExternalDataSource(
  id: string
): Promise<ExternalDataSourceRecord | undefined> {
  const data = await tables();
  return data.externaldatasources.get({ id });
}

async function getAccessKey(
  externalDataSource: ExternalDataSourceRecord
): Promise<ExternalKeyRecord | null> {
  const resource = `/pads/${externalDataSource.padId}`;
  const data = await tables();
  const keys = (
    await data.externaldatasourcekeys.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': resource,
      },
    })
  ).Items;

  return keys[0] || null;
}

async function fetchData(
  event: APIGatewayProxyEvent,
  source: ExternalDataSourceRecord,
  key: ExternalKeyRecord
): Promise<APIGatewayProxyResultV2> {
  const options = {
    useThirdPartyUrl: event.headers['x-use-third-party-test-server'],
  };

  const provider = getProvider(source.provider);
  const table = await provider.fetch(source.externalId, key, provider, options);
  return {
    statusCode: 200,
    body: encodeTable(table),
    isBase64Encoded: true,
    headers: {
      'Content-Type': 'application/x-apache-arrow-stream',
    },
  };
}

export const handler = handle(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    const externalDataSourceId = getDefined(
      getDefined(event.pathParameters).id
    );

    const externalDataSource = await fetchExternalDataSource(
      externalDataSourceId
    );
    if (!externalDataSource) {
      return {
        statusCode: 404,
        body: 'No such data source',
      };
    }

    const { user } = await authenticate(event);
    const ret = await checkAccess(user, externalDataSource);
    if (ret) {
      return ret;
    }

    const key = await getAccessKey(externalDataSource);
    if (!key) {
      return {
        statusCode: 401,
        body: 'Needs authentication',
      };
    }

    return fetchData(event, externalDataSource, key);
  }
);
