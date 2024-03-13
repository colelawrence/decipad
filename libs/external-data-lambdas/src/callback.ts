import { provider as externalDataProvider } from '@decipad/externaldata';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import {
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2 as HttpResponse,
} from 'aws-lambda';
import { OAuth2 } from 'oauth';
import { parse as decodeCookie } from 'simple-cookie';
import { getDefined } from '@decipad/utils';
import { checkNotebookOrWorkspaceAccess } from './checkAccess';
import { getOAuthResponse } from './promisify-oauth';
import { saveExternalKey } from './save-keys';

export const callback = async (
  event: APIGatewayProxyEvent
): Promise<HttpResponse> => {
  const cookies = event.cookies?.map((c) => decodeCookie(c));
  const id = cookies?.find((c) => c.name === 'externaldatasourceid')?.value;
  const { code } =
    event.queryStringParameters as APIGatewayProxyEventQueryStringParameters;

  if (!id || !code) {
    return {
      statusCode: 401,
      body: 'missing parameters',
    };
  }

  const data = await tables();
  const externalDataSource = await data.externaldatasources.get({ id });
  if (!externalDataSource) {
    throw Boom.notFound();
  }

  const user = await checkNotebookOrWorkspaceAccess({
    workspaceId: externalDataSource.workspace_id,
    notebookId: externalDataSource.padId,
    event,
    permissionType: 'READ',
  });

  if (!user) {
    throw Boom.forbidden();
  }

  const provider = getDefined(
    externalDataProvider(externalDataSource.provider),
    `no such provider: ${externalDataSource.provider}`
  );

  const authorizationUrl = new URL(provider.authorizationUrl);

  const getThirdPartyBaseUrlFromHeaders =
    provider.id === 'testdatasource' &&
    event.headers['x-use-third-party-test-server'];

  const basePath = getThirdPartyBaseUrlFromHeaders
    ? getDefined(event.headers['x-use-third-party-test-server'])
    : authorizationUrl.origin;

  const authorizePath = authorizationUrl.pathname;
  const accessTokenPath = new URL(provider.accessTokenUrl).pathname;

  if (provider.getAccessToken != null) {
    const { accessToken, refreshToken } = await provider.getAccessToken(code);

    await saveExternalKey({
      resourceType: 'pads',
      externalDataSource,
      user,
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
    });

    const redirectUri = cookies?.find((c) => c.name === 'redirect_uri')?.value;

    return {
      statusCode: 302,
      headers: {
        Location: decodeURIComponent(redirectUri || '/'),
      },
    };
  }

  const oauth2Client = new OAuth2(
    provider.clientId,
    provider.clientSecret,
    basePath,
    authorizePath,
    accessTokenPath,
    provider.headers ?? {}
  );

  return getOAuthResponse(
    oauth2Client,
    code,
    provider,
    externalDataSource,
    user,
    cookies ?? []
  );
};
