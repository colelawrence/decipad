import { Configuration, OpenAIApi } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/config';
import { expectAuthenticated } from '@decipad/services/authentication';
import handle from '../handle';

const configuration = new Configuration({
  apiKey: thirdParty().openai.apiKey,
});

const openai = new OpenAIApi(configuration);

type RequestBody = {
  url: string;
  exampleRes: string;
  prompt: string;
};

const createPrompt = ({ url, exampleRes, prompt }: RequestBody): string => {
  return `Example response from ${url}:
\`\`\`
${exampleRes}
\`\`\`

JavaScript:
\`\`\`
const fetchFn = async () => {
  // fetch from ${url}, return an array of objects of the form { property_name: value }[]${
    prompt ? `, ${prompt}` : ``
  }
  `; // Indenting here should force prompt completion to indent code so we can use `\n}` as a terminator
};

export const handler = handle(async (event) => {
  await expectAuthenticated(event);

  const { body: requestBodyRaw } = event;
  let requestBodyString: string;

  if (event.isBase64Encoded && requestBodyRaw) {
    requestBodyString = Buffer.from(requestBodyRaw, 'base64').toString('utf8');
  } else if (requestBodyRaw) {
    requestBodyString = requestBodyRaw;
  } else {
    throw Boom.notFound(`Missing request body`);
  }

  let requestBody: RequestBody;
  try {
    requestBody = JSON.parse(requestBodyString);
  } catch (e) {
    throw Boom.badData('Request body is not valid JSON');
  }
  if (
    typeof requestBody.url !== 'string' ||
    typeof requestBody.exampleRes !== 'string' ||
    typeof requestBody.prompt !== 'string'
  ) {
    throw Boom.badData('Request body has wrong format');
  }

  const prompt = createPrompt(requestBody);

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: [`\n}`],
  });

  const newParagraph = completion.data.choices[0].text;
  if (!newParagraph) {
    throw Boom.internal(`Failed to generate code.`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completion: newParagraph.trim(),
    }),
  };
});
