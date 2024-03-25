/* eslint-disable camelcase */
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
import { checkNotebookOrWorkspaceAccess } from './checkAccess';
import { encodeState } from './state';
import { ExternalDataSourceRecord } from '@decipad/backendtypes';
import { app } from '@decipad/backend-config';

/**
 * Helper function
 *
 * @returns [redirectUrl, ExternalDataSource]
 * @throws if various conditions aren't met.
 */
async function getRequestData(
  event: APIGatewayProxyEvent
): Promise<[string, ExternalDataSourceRecord]> {
  const { id } = event.pathParameters || {};
  if (!id) {
    throw Boom.badRequest('missing parameters');
  }

  const { referer } = getDefined(event.headers);

  if (!referer) {
    throw Boom.badRequest('no referer header in request');
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

  return [referer, externalDataSource];
}

export const auth = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
  const [completionUrl, externalDataSource] = await getRequestData(event);
  const provider = externalDataProvider(externalDataSource.provider);

  if (!provider) {
    throw Boom.expectationFailed(
      `no such provider: ${externalDataSource.provider}`
    );
  }

  const authorizationUrl = new URL(provider.authorizationUrl);
  const authorizePath = authorizationUrl.pathname;
  const accessTokenPath = new URL(provider.accessTokenUrl).pathname;

  const oauth2Client = new OAuth2(
    provider.clientId,
    provider.clientSecret,
    authorizationUrl.origin,
    authorizePath,
    accessTokenPath,
    provider.headers || {}
  );

  const state = encodeState({
    completionUrl,
    externalDataId: externalDataSource.id,
  });

  const config = app();

  const authorizeUrl = oauth2Client.getAuthorizeUrl({
    ...provider.authorizationParams,
    scope: provider.scope,
    redirect_uri: `${config.urlBase}${config.apiPathBase}/externaldatasources/callback`,
    cacheBuster: nanoid(),
    state,
  });

  // redirect client to provider authorize url
  return {
    statusCode: 302,
    headers: {
      Location: authorizeUrl,
    },
  };
};
