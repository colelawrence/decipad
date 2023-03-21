import {
  ExternalDataSourceRecord,
  ExternalKeyRecord,
} from '@decipad/backendtypes';
import { encodeTable, provider as getProvider } from '@decipad/externaldata';
import { expectAuthenticated } from '@decipad/services/authentication';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';

const notebooks = resource('notebook');

async function fetchExternalDataSource(
  id: string
): Promise<ExternalDataSourceRecord | undefined> {
  const data = await tables();
  return data.externaldatasources.get({ id });
}

async function getAccessKey(
  externalDataSource: ExternalDataSourceRecord
): Promise<ExternalKeyRecord | null> {
  const notebookResource = `/pads/${externalDataSource.padId}`;
  const data = await tables();
  const keys = (
    await data.externaldatasourcekeys.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': notebookResource,
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

    const [{ user }] = await expectAuthenticated(event);
    await notebooks.expectAuthorized({
      user,
      recordId: externalDataSource.padId,
      minimumPermissionType: 'READ',
    });

    const key = await getAccessKey(externalDataSource);
    if (!key) {
      throw Boom.forbidden('Needs authentication');
    }

    return fetchData(event, externalDataSource, key);
  }
);
