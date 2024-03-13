/* eslint-disable camelcase */
import { app } from '@decipad/backend-config';
import { HttpError } from '@decipad/backend-utils';
import { ExternalDataSourceRecord, User } from '@decipad/backendtypes';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { Provider } from 'libs/externaldata/src/providers';
import { OAuth2 } from 'oauth';
import { parse as decodeCookie } from 'simple-cookie';
import { saveExternalKey } from './save-keys';

export function getOAuthResponse(
  oauth2Client: OAuth2,
  code: string,
  provider: Provider,
  externalDataSource: ExternalDataSourceRecord,
  user: User,
  cookies: Array<ReturnType<typeof decodeCookie>>
): Promise<APIGatewayProxyResultV2> {
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
          reject(new Error(JSON.stringify(err)));
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

          await saveExternalKey({
            resourceType: 'pads',
            externalDataSource,
            user,
            tokenType: token_type,
            scope,
            accessToken,
            refreshToken,
            expiredAt: results.expired_in,
          });

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
