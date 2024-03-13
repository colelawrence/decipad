import { app, thirdParty } from '@decipad/backend-config';
import { Provider } from '.';
import fetch from 'node-fetch';

type NotionAccessTokenResponse = {
  access_token: string;
  bot_id: string;
  workspace_icon: string;
  workspace_id: string;
  workspace_name: string;
};

export const notion = (): Provider => {
  const config = thirdParty();
  return {
    id: 'notion',
    authorizationUrl: 'https://api.notion.com/v1/oauth/authorize',
    accessTokenUrl: 'https://api.notion.com/v1/oauth/token',
    clientId: config.notion.clientId,
    clientSecret: config.notion.clientSecret,
    scope: '',
    authorizationParams: {
      response_type: 'code',
    },
    headers: {},

    async getAccessToken(code) {
      const a = app();

      const res = await fetch(this.accessTokenUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${config.notion.clientId}:${config.notion.clientSecret}`,
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          redirect_uri: `${a.urlBase}${a.apiPathBase}/externaldatasources/callback`,
          code,
        }),
      });

      const jsonRes = (await res.json()) as NotionAccessTokenResponse;

      return {
        accessToken: jsonRes.access_token,
        refreshToken: undefined,
      };
    },
  };
};
