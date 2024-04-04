import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';

import type { ThreadCreateParams } from 'openai/resources/beta/threads/threads';

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

export const handler = handle(async (event) => {
  const [{ user }] = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('Missing Parameters');
  }
  const padId = event.pathParameters.padid;
  if (!padId) {
    throw Boom.notAcceptable('Missing pad ID parameter');
  }
  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  try {
    const initialMessage: ThreadCreateParams.Message = {
      role: 'user',
      content: 'Hello',
    };

    const thread = await openai.beta.threads.create({
      messages: [initialMessage],
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ threadId: thread.id }),
    };
  } catch (e) {
    throw Boom.internal('Unable to create thread');
  }
});
