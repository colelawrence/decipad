import { thirdParty } from '@decipad/backend-config';
import { Handler } from '@decipad/backendtypes';
import { provider } from '@decipad/externaldata';
import { getDefined } from '@decipad/utils';

const getNotionDbQuery = (databaseId: string) =>
  `https://api.notion.com/v1/databases/${databaseId}/query`;

export const notion: Handler = async (event) => {
  const notionDatabaseId = getDefined(getDefined(event.pathParameters).id);
  const notionProvider = getDefined(
    provider('notion'),
    'Notion provider should be defined'
  );

  const { notion: notionKey } = thirdParty();

  const resp = await fetch(getNotionDbQuery(notionDatabaseId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionKey.apiKey}`,
      ...(notionProvider.dataHeaders ?? {}),
    },
  });

  const body = Buffer.from(await resp.arrayBuffer());

  return {
    statusCode: resp.status,
    body: body.toString('base64'),
    isBase64Encoded: true,
  };
};
