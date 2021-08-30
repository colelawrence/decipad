import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2 as HttpResponse,
  APIGatewayProxyEventQueryStringParameters,
} from 'aws-lambda';
import { OAuth2 } from 'oauth';
import { nanoid } from 'nanoid';
import { parse as decodeCookie } from 'simple-cookie';
import { ExternalKeyRecord } from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import { provider as externalDataProvider } from '@decipad/externaldata';
import { thirdParty as thirdPartyConfig, app } from '@decipad/config';
import handle from '../handle';
import { HttpError } from '../HttpError';
import getDefined from '../../common/get-defined';
import timestamp from '../../common/timestamp';

export const handler = handle(
  async (event: APIGatewayProxyEvent): Promise<HttpResponse> => {
    const { user } = await authenticate(event);
    if (!user) {
      return {
        statusCode: 401,
        body: 'Needs authentication',
      };
    }

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
    const resource = `/externaldatasources/${id}`;
    if (!(await isAuthorized(resource, user, 'READ'))) {
      return {
        statusCode: 403,
        body: 'Needs authorization',
      };
    }

    const data = await tables();
    const externalDataSource = await data.externaldatasources.get({ id });
    if (!externalDataSource) {
      return {
        statusCode: 404,
        body: 'Not found',
      };
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
              token_type,
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
  }
);
