import { ExternalKeyRecord } from '@decipad/backendtypes';
import { app, thirdParty as thirdPartyConfig } from '@decipad/backend-config';
import { provider as externalDataProvider } from '@decipad/externaldata';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import {
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2 as HttpResponse,
} from 'aws-lambda';
import { nanoid } from 'nanoid';
import { OAuth2 } from 'oauth';
import { parse as decodeCookie } from 'simple-cookie';
import { getDefined } from '@decipad/utils';
import { HttpError, timestamp } from '@decipad/backend-utils';
import { checkNotebookOrWorkspaceAccess } from './checkAccess';

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
  const oauth2Client = new OAuth2(
    provider.clientId,
    provider.clientSecret,
    basePath,
    authorizePath,
    accessTokenPath,
    provider.headers || {}
  );

  const config = app();
  return new Promise((resolve, reject) => {
    oauth2Client.getOAuthAccessToken(
      code,
      {
        grant_type: 'authorization_code',
        scope: provider.scope,
        redirect_uri: `${config.urlBase}${config.apiPathBase}/externaldatasources/callback`,
      },
      async (err, accessToken, refreshToken, results) => {
        if (err) {
          reject(err);
        } else if (!accessToken) {
          reject(
            new HttpError(
              'authentication with third-party failed: no access token',
              401
            )
          );
        } else {
          // eslint-disable-next-line camelcase
          const { scope, token_type = 'Bearer' } = results;
          if (scope && scope !== provider.scope) {
            reject(
              new HttpError(
                `authentication with third-party failed: scope should be ${provider.scope}`,
                401
              )
            );
            return;
          }
          const keyRecord: ExternalKeyRecord = {
            id: nanoid(),
            resource_uri: `/pads/${externalDataSource.padId}`,
            provider: externalDataSource.provider,
            // eslint-disable-next-line camelcase
            token_type,
            createdBy: user.id,
            scope,
            access_token: accessToken,
            refresh_token: refreshToken,
            createdAt: timestamp(),
            expiresAt:
              timestamp() +
              (Number(results.expires_in) ||
                thirdPartyConfig().defaultTokenExpirationSeconds),
          };
          await data.externaldatasourcekeys.create(keyRecord);

          const redirectUri = cookies?.find(
            (c) => c.name === 'redirect_uri'
          )?.value;

          // redirect user back to where they were
          resolve({
            statusCode: 302,
            headers: {
              Location: decodeURIComponent(redirectUri || '/'),
            },
          });
        }
      }
    );
  });
};
