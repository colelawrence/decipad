import { request } from 'http';
import getBody from 'raw-body';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import {
  ExternalDataSourceRecord,
  ExternalKeyRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import handle from '../handle';
import getDefined from '../../common/get-defined';

async function checkAccess(
  event: APIGatewayProxyEvent
): Promise<void | APIGatewayProxyResultV2> {
  const { user } = await authenticate(event);
  if (!user) {
    return {
      statusCode: 401,
      body: 'Needs authentication',
    };
  }

  const { id } = event.pathParameters || {};
  if (!id) {
    return {
      statusCode: 401,
      body: 'missing parameters',
    };
  }
  const resource = `/externaldatasources/${id}`;
  if (!(await isAuthorized(resource, user, 'READ'))) {
    return {
      statusCode: 403,
      body: 'Needs authorization',
    };
  }

  return undefined;
}

async function getAccessKeys(externalSourceId: string) {
  const data = await tables();

  const keys = (
    await data.externaldatasourcekeys.query({
      IndexName: 'byExternalDataSourceAndStatus',
      KeyConditionExpression:
        'externaldatasource_id = :externaldatasource_id and status_code = :status_code',
      ExpressionAttributeValues: {
        ':externaldatasource_id': externalSourceId,
        ':status_code': 'ACTIVE',
      },
    })
  ).Items;

  return keys;
}

async function fetchExternalDataSource(
  id: string
): Promise<ExternalDataSourceRecord | undefined> {
  const data = await tables();
  return data.externaldatasources.get({ id });
}

async function fetchData(
  event: APIGatewayProxyEvent,
  source: ExternalDataSourceRecord,
  key: ExternalKeyRecord
): Promise<APIGatewayProxyResultV2> {
  const getThirdPartyUrlFromHeaders =
    source.provider === 'testdatasource' &&
    event.headers['x-use-third-party-test-server'];
  const dataUrl = getThirdPartyUrlFromHeaders
    ? getDefined(event.headers['x-use-third-party-test-server'])
    : source.externalId;

  return new Promise<APIGatewayProxyResultV2>((resolve, reject) => {
    const req = request(
      dataUrl,
      {
        method: 'GET',
        headers: {
          Authentication: `Bearer ${key.access_token}`,
        },
      },
      (res) => {
        res.once('error', reject);
        // TODO: could we please do this streaming?
        getBody(res, { encoding: 'utf-8' }, (err, body: string) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            statusCode: 200,
            body,
          });
        });
      }
    );
    req.once('error', reject);
    req.end();
  });
}

export const handler = handle(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    const ret = await checkAccess(event);
    if (ret) {
      return ret;
    }

    const id = getDefined(getDefined(event.pathParameters).id);
    const keys = await getAccessKeys(id);
    if (!keys.length) {
      return {
        statusCode: 401,
        body: 'Needs authentication',
      };
    }

    const dataSource = await fetchExternalDataSource(id);
    if (!dataSource) {
      return {
        statusCode: 404,
        body: 'No such data source',
      };
    }

    const fetchResult = await fetchData(event, dataSource, getDefined(keys[0]));
    return fetchResult;
  }
);
