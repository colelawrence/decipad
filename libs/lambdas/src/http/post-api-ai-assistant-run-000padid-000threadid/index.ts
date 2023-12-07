import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';
import { exportNotebookContent } from '@decipad/services/notebooks';
import { RootDocument } from '@decipad/editor-types';

import { verbalizeDoc } from '@decipad/doc-verbalizer';

import { ASSISTANT_SYSTEM_PROMPT } from './constants';
import { getRemoteComputer } from '@decipad/remote-computer';

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

  const threadId = event.pathParameters.threadid;

  if (!threadId) {
    throw Boom.notAcceptable('Missing thread ID parameter');
  }

  // We can be pretty sure this'll be RootDocument as Document is converted to RootDocument when a pad is opened
  const doc = await exportNotebookContent<RootDocument>(padId);

  let verbalizedDoc: string;

  try {
    const { verbalized } = verbalizeDoc(doc, getRemoteComputer());

    verbalizedDoc = verbalized.map((v) => v.verbalized).join('\n');
  } catch (e) {
    throw Boom.internal('Unable to parse document contents');
  }

  try {
    const instructions =
      `${ASSISTANT_SYSTEM_PROMPT}` +
      `\nThis is the current version of user document:\n` +
      `${verbalizedDoc}`;

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: 'asst_sxZeyVokLqw9FpLoZcOz7SYL', // TODO: Move assistant ID to .env config
      instructions,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ runId: run.id }),
    };
  } catch (e) {
    throw Boom.internal('Unable to create run');
  }
});
