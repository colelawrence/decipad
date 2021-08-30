import { OAuth2 } from 'oauth';
import { ExternalKeyRecord } from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { Provider } from '.';

interface RenewResult {
  accessToken?: string;
  refreshToken?: string;
}

export async function renewKey(
  key: ExternalKeyRecord,
  provider: Provider
): Promise<ExternalKeyRecord | null> {
  if (!key.refresh_token) {
    return null;
  }

  const authorizationUrl = new URL(provider.authorizationUrl);
  const basePath = authorizationUrl.origin;
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

  const params = {
    grant_type: 'refresh_token',
    valid_for: 60 * 60, // 1 hour
  };
  const { refreshToken, accessToken } = await new Promise<RenewResult>(
    (resolve, reject) => {
      oauth2Client.getOAuthAccessToken(
        key.refresh_token,
        params,
        (err, aToken, rToken) => {
          if (err) {
            reject(err);
          } else if (aToken) {
            resolve({ accessToken: aToken, refreshToken: rToken });
          } else {
            resolve({});
          }
        }
      );
    }
  );

  if (!accessToken) {
    return null;
  }

  const data = await tables();
  key.access_token = accessToken;
  if (refreshToken) {
    key.refresh_token = refreshToken;
  }
  await data.externaldatasourcekeys.put(key);

  return key;
}
