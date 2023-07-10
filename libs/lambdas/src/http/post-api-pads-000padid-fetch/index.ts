/* eslint-disable import/no-import-module-exports */
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { resource } from '@decipad/backend-resources';
import { getAuthenticatedUser } from '@decipad/services/authentication';
import tables from '@decipad/tables';
import { fetch } from 'cross-fetch';
import Handlebars from 'handlebars';
import { identity } from '@decipad/utils';
import handle from '../handle';

const notebooks = resource('notebook');

type MyRequest = Omit<Request, 'body' | 'headers'> & {
  body: string;
  isBase64Encoded?: boolean;
  method: Request['method'];
  headers: Record<string, string>;
  signal: never;
};

const fetchSecrets = async (
  workspaceId: string
): Promise<Record<string, string>> => {
  const data = await tables();
  return Object.fromEntries(
    (
      await data.secrets.query({
        IndexName: 'byWorkspace',
        KeyConditionExpression: 'workspace_id = :workspace_id',
        ExpressionAttributeValues: {
          ':workspace_id': workspaceId,
        },
      })
    ).Items.map((secret) => {
      return [secret.name, secret.secret];
    })
  );
};

const replaceWithSecrets = (
  template: string,
  secrets: Record<string, string>
): string => {
  if (!template) {
    return template;
  }
  const cTemplate = Handlebars.compile(template, {
    strict: true,
    preventIndent: true,
  });
  return cTemplate({ secrets });
};

const toRecord = (
  headers: Headers | Record<string, string>,
  map: ([key, value]: [string, string]) => [string, string] = identity
): Record<string, string> =>
  Object.fromEntries(Object.entries(headers).map(map));

const replaceRequestWithSecrets = (
  request: MyRequest,
  secrets: Record<string, string>
): MyRequest => {
  const body = request.body
    ? request.isBase64Encoded
      ? Buffer.from(request.body, 'base64').toString('base64')
      : request.body
    : request.body;
  return {
    ...request,
    url: replaceWithSecrets(request.url, secrets),
    body: body && replaceWithSecrets(body, secrets),
    headers:
      request.headers &&
      toRecord(request.headers, ([key, value]) => [
        key,
        replaceWithSecrets(value, secrets),
      ]),
  };
};

export const handler = handle(
  async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const padId = event.pathParameters?.padid;
    if (!padId) {
      throw Boom.notAcceptable('missing parameters');
    }
    const user = await getAuthenticatedUser(event);
    await notebooks.expectAuthorized({
      user,
      recordId: padId,
      minimumPermissionType: 'READ',
    });

    let { body } = event;
    if (!body) {
      throw Boom.notAcceptable('missing body');
    }
    if (event.isBase64Encoded) {
      body = Buffer.from(body, 'base64').toString('utf-8');
    }

    const data = await tables();
    const notebook = await data.pads.get({ id: padId });
    if (!notebook) {
      throw Boom.notFound('missing notebook');
    }
    const secrets = await fetchSecrets(notebook.workspace_id);
    const userRequest: MyRequest = JSON.parse(body);
    if (typeof userRequest.url !== 'string') {
      throw Boom.notAcceptable('missing url');
    }
    let ourRequest: MyRequest;
    try {
      ourRequest = replaceRequestWithSecrets(userRequest, secrets);
    } catch (err) {
      throw Boom.notAcceptable((err as Error).message);
    }
    if (ourRequest.url.includes('decipad.com')) {
      throw Boom.notAcceptable('invalid domain');
    }
    const response = await fetch(ourRequest.url, ourRequest);
    const responseBody = await response.arrayBuffer();
    return {
      statusCode: response.status,
      headers: toRecord(response.headers),
      body: Buffer.from(responseBody).toString('base64'),
      isBase64Encoded: true,
    };
  }
);
