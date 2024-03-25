import { app, thirdParty } from '@decipad/backend-config';
import fetch from 'node-fetch';
import { NotionProvider } from './types';

type NotionAccessTokenResponse = {
  access_token: string;
  bot_id: string;
  workspace_icon: string;
  workspace_id: string;
  workspace_name: string;
};

type NotionSearchResponse = {
  next_cursor: string | null;
  has_more: boolean;
  results: Array<object>;
};

async function singleNotionPage(
  authHeaders: Record<string, string>,
  startCursor: string | undefined
): Promise<NotionSearchResponse> {
  const notionResponse = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      page_size: 100,
      start_cursor: startCursor,
      filter: {
        value: 'database',
        property: 'object',
      },
    }),
  });

  // not complete type.
  const res = (await notionResponse.json()) as NotionSearchResponse;

  return res;
}

export const notion = (): NotionProvider => {
  const config = thirdParty();
  return {
    id: 'notion',
    type: 'notion',
    authorizationUrl: 'https://api.notion.com/v1/oauth/authorize',
    accessTokenUrl: 'https://api.notion.com/v1/oauth/token',
    clientId: config.notion.clientId,
    clientSecret: config.notion.clientSecret,
    scope: '',
    authorizationParams: {
      response_type: 'code',
    },
    headers: {},
    dataHeaders: {
      'Notion-Version': '2022-06-28',
    },

    async getAccessToken(code) {
      const a = app();

      const base64Credentials = Buffer.from(
        `${config.notion.clientId}:${config.notion.clientSecret}`
      ).toString('base64');

      const res = await fetch(this.accessTokenUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
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
        resourceName: jsonRes.workspace_name,
      };
    },

    async getAllDatabases(authHeaders) {
      const results = [];

      let hasMore = true;
      let startCursor: string | undefined;
      while (hasMore) {
        // eslint-disable-next-line no-await-in-loop
        const notionRes = await singleNotionPage(authHeaders, startCursor);
        results.push(notionRes.results);

        hasMore = notionRes.has_more;
        startCursor = notionRes.next_cursor ?? undefined;
      }

      return results.flat();
    },
  };
};
