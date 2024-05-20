import { OpenAI } from 'openai';
import { getDefined } from '@decipad/utils';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { resource } from '@decipad/backend-resources';
import { getAuthenticatedUser } from '@decipad/services/authentication';
import { thirdParty } from '@decipad/backend-config';
import handle from '../handle';
import type { ExternalDataSourceRecord } from '../../types';
import { getSchemaString } from './getSchemaString';
import { resourceusage } from '@decipad/services';

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

const notebook = resource('notebook');

const fetchExternalDataSource = async (
  id: string
): Promise<ExternalDataSourceRecord | undefined> => {
  const data = await tables();
  return data.externaldatasources.get({ id });
};

type Body = {
  externalDataSourceId: string;
  prompt: string;
  workspaceId: string;
};

export const handler = handle(async (event) => {
  const rawRequestBody = event.body;
  if (!event.isBase64Encoded || !rawRequestBody) {
    throw Boom.internal('Invalid request body.');
  }
  let requestBody: Body;
  try {
    requestBody = JSON.parse(
      Buffer.from(rawRequestBody, 'base64').toString('utf8')
    );
  } catch (e) {
    throw Boom.internal('Request body not valid JSON.');
  }

  const externalDataSource = await fetchExternalDataSource(
    requestBody.externalDataSourceId
  );
  if (!externalDataSource) {
    throw Boom.notFound(
      `Could not find external data source with id ${requestBody.externalDataSourceId}`
    );
  }

  const user = await getAuthenticatedUser(event);

  await notebook.expectAuthorized({
    minimumPermissionType: 'READ',
    recordId: getDefined(externalDataSource?.padId),
    user,
  });

  const { workspaceId } = requestBody;

  const schemaString = await getSchemaString(externalDataSource.externalId);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `You generate SQL code based on a given schema, taking into account the user's request. Your response is SQL code with the schema commented. For example...
User message:
"""
User prompt: list all dogs from the UK

User schema: mysql
"""

Your response:
### MySQL tables, with their properties
### A query to ${prompt}

SELECT * FROM dogs WHERE dogs.country = "UK"
`,
      },
      {
        role: 'user',
        content: `User prompt: ${requestBody.prompt}

User schema: ${schemaString}
`,
      },
    ],
    temperature: 0,
    max_tokens: 150,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: ['#', ';'],
  });
  const sqlQuery = completion.choices[0].message.content;
  if (!sqlQuery) {
    throw Boom.internal(`Could not complete query`);
  }

  await resourceusage.ai.updateWorkspaceAndUser({
    userId: user?.id,
    workspaceId,
    usage: completion.usage,
  });

  const usage = await resourceusage.ai.getUsage(workspaceId);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completion: `# ${requestBody}\nSELECT\n${sqlQuery};`,
      usage,
    }),
  };
});
