import { Configuration, OpenAIApi } from 'openai';
import { getDefined } from '@decipad/utils';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { resource } from '@decipad/backend-resources';
import { getAuthenticatedUser } from '@decipad/services/authentication';
import { thirdParty } from '@decipad/config';
import handle from '../handle';
import { ExternalDataSourceRecord } from '../../types';
import { getSchemaString } from './getSchemaString';

const configuration = new Configuration({
  apiKey: thirdParty().openai.apiKey,
});

const openai = new OpenAIApi(configuration);

const notebook = resource('notebook');

const fetchExternalDataSource = async (
  id: string
): Promise<ExternalDataSourceRecord | undefined> => {
  const data = await tables();
  return data.externaldatasources.get({ id });
};

const createPrompt = (schemaString: string, prompt: string): string => {
  const commentedSchemaString = schemaString
    .split('\n')
    .map((l) => `# ${l}`)
    .join('\n');
  return `### MySQL tables, with their properties
#
${commentedSchemaString}
#
### A query to ${prompt}
SELECT
`;
};

type Body = { externalDataSourceId: string; prompt: string };

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

  await notebook.expectAuthorized({
    minimumPermissionType: 'READ',
    recordId: getDefined(externalDataSource?.padId),
    user: await getAuthenticatedUser(event),
  });

  const schemaString = await getSchemaString(externalDataSource.externalId);

  const prompt = createPrompt(schemaString, requestBody.prompt);

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0,
    max_tokens: 150,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: ['#', ';'],
  });
  const sqlQuery = completion.data.choices[0].text;
  if (!sqlQuery) {
    throw Boom.internal(`Could not complete query`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completion: `# ${requestBody}\nSELECT\n${sqlQuery};`,
    }),
  };
});
