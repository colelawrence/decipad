import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import handle from '../handle';
import type { ChatCompletion } from 'openai/resources';
import { resourceusage } from '@decipad/services';

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

type RequestBody = {
  paragraph: string;
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
  } catch (e) {
    throw Boom.badData('Request body is not valid JSON');
  }
  if (
    typeof requestBody.paragraph !== 'string' ||
    typeof requestBody.prompt !== 'string' ||
    typeof requestBody.workspaceId !== 'string'
  ) {
    throw Boom.badData('Request body has wrong format');
  }

  const { workspaceId } = requestBody;

  const hasReachedLimit = await resourceusage.ai.hasReachedLimit(workspaceId);

  if (hasReachedLimit) {
    throw Boom.paymentRequired('You are out of AI credits');
  }

  let completion: ChatCompletion;

  try {
    completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You rewrite paragraphs for the user, taking into account the user's request. For example...
User message:
"""
User prompt: rewrite this paragraph in French

User paragraph: I like chocolate. Especially chocolate from Switzerland!
"""

Your response:
"""
J'aime le chocolat. Surtout le chocolat de Suisse!
"""`,
        },
        {
          role: 'user',
          content: `User prompt: ${requestBody.prompt}

User paragraph: ${requestBody.paragraph}`,
        },
      ],
      temperature: 0.75,
      max_tokens: 300,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
  } catch (e) {
    throw Boom.internal('OpenAI request failed', e);
  }
  const newParagraph = completion.choices[0].message.content;
  if (!newParagraph) {
    throw Boom.internal(`Could not rewrite paragraph`);
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
