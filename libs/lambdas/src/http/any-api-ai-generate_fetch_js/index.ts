/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable unused-imports/no-unused-vars */ import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import handle from '../handle';
import { resourceusage } from '@decipad/services';

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

type RequestBody = {
  url: string;
  exampleRes: string;
  prompt: string;
  workspaceId: string;
};

export const handler = handle(async (event) => {
  const [{ user }] = await expectAuthenticated(event);

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
  } catch (_e) {
    throw Boom.badData('Request body is not valid JSON');
  }
  if (
    typeof requestBody.url !== 'string' ||
    typeof requestBody.exampleRes !== 'string' ||
    typeof requestBody.prompt !== 'string'
  ) {
    throw Boom.badData('Request body has wrong format');
  }
  const { workspaceId } = requestBody;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You generate JavaScript code to fetch data from an API, taking into account the user's request. The user may also provide a response example and a URL to fetch data from. If the user doesn't provide a URL or response example, just consider only the user prompt. Your response is JavaScript code without formatting. For example...
User message:
"""
User prompt: list all dogs that don't have regional breeds

User url: https://dog.ceo/api/breeds/list/all

User response example: [ {
  "name": "affenpinscher",
  "hasBreeds": false
},  {
  "name": "appenzeller",
  "hasBreeds": false
}]
"""

Your response:
const res = await fetch('https://dog.ceo/api/breeds/list/all');
const data = await res.json();
const message = data.message;
const dogsNoSubsbreeds = Object.keys(message).map((breed) => {
  return {
    name: breed,
    hasBreeds: message[breed].length > 0
  }
}).filter((breed) => !breed.hasBreeds)
return dogsNoSubsbreeds;
`,
      },
      {
        role: 'user',
        content: `User prompt: ${requestBody.prompt}

User url: ${requestBody.url}

User response example: ${requestBody.exampleRes}
`,
      },
    ],
    temperature: 0,
    max_tokens: 1000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: [`\n}`],
  });

  const newParagraph = completion.choices[0].message.content;
  if (!newParagraph) {
    throw Boom.internal(`Failed to generate code.`);
  }

  await resourceusage.ai.updateWorkspaceAndUser({
    userId: user.id,
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
      completion: newParagraph.trim(),
      usage,
    }),
  };
});
