import { app } from '@decipad/config';
import { provider as externalDataProvider } from '@decipad/externaldata';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { nanoid } from 'nanoid';
import { OAuth2 } from 'oauth';
import { stringify as encodeCookie } from 'simple-cookie';
import { checkNotebookOrWorkspaceAccess } from './checkAccess';

export const auth = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
  const { id } = event.pathParameters || {};
  if (!id) {
    throw Boom.badRequest('missing parameters');
  }

  const data = await tables();
  const externalDataSource = await data.externaldatasources.get({ id });
  if (!externalDataSource) {
    throw Boom.notFound();
  }

  await checkNotebookOrWorkspaceAccess({
    workspaceId: externalDataSource.workspace_id,
    notebookId: externalDataSource.padId,
    event,
  });

  const provider = externalDataProvider(externalDataSource.provider);

  if (!provider) {
    throw Boom.expectationFailed(
      `no such provider: ${externalDataSource.provider}`
    );
  }

  const authorizationUrl = new URL(provider.authorizationUrl);
  const getThirdPartyBaseUrlFromHeaders =
    provider.id === 'testdatasource' &&
    event.headers['x-use-third-party-test-server'];
  const basePath = getThirdPartyBaseUrlFromHeaders
    ? getDefined(event.headers['x-use-third-party-test-server'])
    : authorizationUrl.origin;
  const authorizePath = authorizationUrl.pathname;
  const accessTokenPath = new URL(provider.accessTokenUrl).pathname;
  const oauth2Client = new OAuth2(
    provider.clientId,
    provider.clientSecret,
    basePath,
    authorizePath,
    accessTokenPath,
    provider.headers || {}
  );

  const config = app();
  const authorizeUrl = oauth2Client.getAuthorizeUrl({
    ...provider.authorizationParams,
    scope: provider.scope,
    redirect_uri: `${config.urlBase}${config.apiPathBase}/externaldatasources/callback`,
    cacheBuster: nanoid(),
  });

  // set client cookies
  const cookies = [
    encodeCookie({
      name: 'externaldatasourceid',
      value: id,
      httponly: true,
      path: '/',
    }),
  ];
  const { redirect_uri: redirectUri } = event.queryStringParameters || {};
  if (redirectUri) {
    cookies.push(
      encodeCookie({
        name: 'redirect_uri',
        value: redirectUri,
        httponly: true,
        path: '/',
      })
    );
  }

  // redirect client to provider authorize url
  return {
    statusCode: 302,
    cookies,
    headers: {
      Location: authorizeUrl,
    },
  };
};
