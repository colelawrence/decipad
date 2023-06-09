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
  paragraph: string;
  prompt: string;
};

const createPrompt = ({ paragraph, prompt }: RequestBody) => {
  return `Original paragraph:

${paragraph}

Paragraph rewritten ${prompt}:`;
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
    typeof requestBody.paragraph !== 'string' ||
    typeof requestBody.prompt !== 'string'
  ) {
    throw Boom.badData('Request body has wrong format');
  }

  const prompt = createPrompt(requestBody);

  let completion: Awaited<ReturnType<typeof openai.createCompletion>>;
  try {
    completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0.75,
      max_tokens: 300,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
  } catch (e) {
    throw Boom.internal('OpenAI request failed', e);
  }
  const newParagraph = completion.data.choices[0].text;
  if (!newParagraph) {
    throw Boom.internal(`Could not rewrite paragraph`);
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
