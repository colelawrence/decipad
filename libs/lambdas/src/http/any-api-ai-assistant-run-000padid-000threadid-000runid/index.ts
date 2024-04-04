/* eslint-disable complexity */
import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';

import type { RequestPayload } from './types';
import { timeout } from '@decipad/utils';
import type { Run } from 'openai/resources/beta/threads/runs/runs';

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

export const COMPLETED_STATUSES = [
  'completed',
  'failed',
  'expired',
  'cancelled',
  'requires_action',
];

const retrieveRunUntilCompleted = async (
  threadId: string,
  runId: string,
  attempt = 1
): Promise<Run> => {
  const currentAttempt = attempt + 1;
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);

  if (COMPLETED_STATUSES.includes(run.status)) return run;

  await timeout(6000 / currentAttempt);

  return retrieveRunUntilCompleted(threadId, runId, currentAttempt);
};

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

  const runId = event.pathParameters.runid;

  if (!runId) {
    throw Boom.notAcceptable('Missing run ID parameter');
  }

  const { method } = event.requestContext.http;

  if (method === 'GET') {
    try {
      const run = await retrieveRunUntilCompleted(threadId, runId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: run.status,
          actions: run.required_action?.submit_tool_outputs.tool_calls ?? [],
        }),
      };
    } catch (e) {
      throw Boom.internal('Unable to get run');
    }
  }

  if (method === 'DELETE') {
    try {
      await openai.beta.threads.runs.cancel(threadId, runId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'Run cancelled',
      };
    } catch (e) {
      throw Boom.internal('Unable to cancel run');
    }
  }

  // Submit tool outputs to run
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

    const { result } = payload;

    if (result) {
      try {
        await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
          tool_outputs: result,
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: 'Outputs submitted',
        };
      } catch (e) {
        throw Boom.internal('Unable to submit outputs to run');
      }
    } else {
      throw Boom.notAcceptable('Missing tool outputs');
    }
  }

  throw Boom.notAcceptable('Invalid method');
});
