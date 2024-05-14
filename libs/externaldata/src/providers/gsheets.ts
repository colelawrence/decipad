import { app, thirdParty } from '@decipad/backend-config';
import type { GoogleSheetProvider } from './types';
import { OAuth2 } from 'oauth';
import { HttpError } from '../utils/HttpError';
import { z } from 'zod';

const resultValidator = z.object({
  scope: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
});

const refreshAccessTokenValidator = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.literal('Bearer'),
  id_token: z.string(),
});

const userInfoValidtor = z.object({
  id: z.string(),
  email: z.string(),
  verified_email: z.boolean(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  picture: z.string(),
});

async function getUserInfo(
  client: OAuth2,
  accessToken: string
): Promise<{ resourceName: string; resourceId: string }> {
  return new Promise((resolve, reject) => {
    client.get(
      'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      accessToken,
      (err, result) => {
        if (err != null) {
          reject(new Error(JSON.stringify(err)));
          return;
        }

        if (typeof result !== 'string') {
          reject(new Error('Expected result to be of type string'));
          return;
        }

        const validatedResult = userInfoValidtor.safeParse(JSON.parse(result));
        if (!validatedResult.success) {
          reject(validatedResult.error.toString());
          return;
        }

        resolve({
          resourceId: validatedResult.data.id,
          resourceName: validatedResult.data.email,
        });
      }
    );
  });
}

export const gsheets = (): GoogleSheetProvider => {
  const config = thirdParty();
  return {
    id: 'gsheets',
    type: 'gsheets',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
    accessTokenUrl: 'https://accounts.google.com/o/oauth2/token',
    clientId: config.google.sheets.clientId,
    clientSecret: config.google.sheets.clientSecret,
    scope:
      'email profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly',
    authorizationParams: {
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    },
    headers: {},

    async getAccessToken(code) {
      const appConfig = app();

      const oauth2Client = new OAuth2(
        this.clientId,
        this.clientSecret,
        new URL(this.authorizationUrl).origin,
        new URL(this.authorizationUrl).pathname,
        new URL(this.accessTokenUrl).pathname,
        this.headers
      );

      return new Promise((resolve, reject) => {
        oauth2Client.getOAuthAccessToken(
          code,
          {
            grant_type: 'authorization_code',
            scope: this.scope,
            redirect_uri: `${appConfig.urlBase}${appConfig.apiPathBase}/externaldatasources/callback`,
          },
          async (err, accessToken, refreshToken, results) => {
            if (err) {
              reject(new Error(JSON.stringify(err)));
              return;
            }

            if (!accessToken) {
              reject(
                new HttpError(
                  'Authentication with third-party failed: No access token',
                  401
                )
              );
              return;
            }

            const validatedResult = resultValidator.parse(results);
            const info = await getUserInfo(oauth2Client, accessToken);

            resolve({
              ...info,
              accessToken,
              refreshToken,
              tokenType: validatedResult.token_type,
              scope: validatedResult.scope,
              expiresIn: validatedResult.expires_in.toString(),
            });
          }
        );
      });
    },

    async refreshAccessToken(refreshToken) {
      const res = await fetch(this.accessTokenUrl, {
        method: 'POST',
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const refreshAccessTokenRes = refreshAccessTokenValidator.parse(
        await res.json()
      );

      return {
        accessToken: refreshAccessTokenRes.access_token,
        expiresIn: refreshAccessTokenRes.expires_in.toString(),
        tokenType: refreshAccessTokenRes.token_type,
        scope: refreshAccessTokenRes.scope,
      };
    },
  };
};
