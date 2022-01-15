import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import Boom from '@hapi/boom';
import {
  User,
  ExternalDataSourceRecord,
  ExternalKeyRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { provider as getProvider, encodeTable } from '@decipad/externaldata';
import { getDefined } from '@decipad/utils';
import handle from '../handle';

async function checkAccess(
  user: User | undefined,
  externalDataSource: ExternalDataSourceRecord
): Promise<void> {
  if (!user) {
    throw Boom.forbidden('Needs authentication');
  }

  const resource = `/pads/${externalDataSource.padId}`;
  await expectAuthorized({ resource, user, permissionType: 'READ' });
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

    const { user } = await expectAuthenticated(event);
    await checkAccess(user, externalDataSource);

    const key = await getAccessKey(externalDataSource);
    if (!key) {
      throw Boom.forbidden('Needs authentication');
    }

    return fetchData(event, externalDataSource, key);
  }
);
