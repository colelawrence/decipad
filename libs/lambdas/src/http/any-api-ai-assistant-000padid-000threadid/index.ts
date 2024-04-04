/* eslint-disable complexity */
import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';

import type { RequestPayload } from './types';

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

export const handler = handle(async (event) => {
  const [{ user }] = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('Missing parameters');
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

  const threadId = event.pathParameters.threadid;

  if (!threadId) {
    throw Boom.notAcceptable('Missing thread ID parameter');
  }

  const { method } = event.requestContext.http;

  // Retrieve message history
  if (method === 'GET') {
    try {
      const { data: messages } = await openai.beta.threads.messages.list(
        threadId
      );

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      };
    } catch (e) {
      throw Boom.internal('Unable to get messages');
    }
  }

  // Delete message thread
  if (method === 'DELETE') {
    try {
      await openai.beta.threads.del(threadId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'Thread deleted',
      };
    } catch (e) {
      throw Boom.internal('Unable to delete thread');
    }
  }

  // Add message to thread
  if (method === 'POST') {
    const { body: requestBodyRaw } = event;

    let requestBodyString: string;

    if (event.isBase64Encoded && requestBodyRaw) {
      requestBodyString = Buffer.from(requestBodyRaw, 'base64').toString(
        'utf8'
      );
    } else if (requestBodyRaw) {
      requestBodyString = requestBodyRaw;
    } else {
      throw Boom.notAcceptable('Missing request body');
    }

    const payload: RequestPayload = JSON.parse(requestBodyString);

    const { message } = payload;

    if (message) {
      try {
        await openai.beta.threads.messages.create(threadId, message);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: 'Message added',
        };
      } catch (e) {
        throw Boom.internal('Unable to add message to thread');
      }
    } else {
      throw Boom.notAcceptable('Missing user message');
    }
  }

  throw Boom.notAcceptable('Invalid method');
});
