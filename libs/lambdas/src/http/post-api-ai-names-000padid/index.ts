import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';
import { exportNotebookContent } from '@decipad/services/notebooks';
import { RootDocument } from '@decipad/editor-types';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import { getRemoteComputer } from '@decipad/remote-computer';
import { track } from '@decipad/backend-analytics';
import { DOC_FILTER_ITEMS, SYSTEM_PROMPT } from './constants';
import { resourceusage } from '@decipad/services';
import tables from '@decipad/tables';

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

export const handler = handle(async (event) => {
  const [{ user }] = await expectAuthenticated(event);
  const { pads } = await tables();

  if (!event.pathParameters) {
    throw Boom.notAcceptable('Missing parameters');
  }

  const padId = event.pathParameters.padid;
  if (!padId) {
    throw Boom.notAcceptable('Missing padId parameter');
  }

  const workspaceId = (await pads.get({ id: padId }))?.workspace_id;

  if (!workspaceId) {
    throw Boom.badRequest('AI cannot be used on a pad without workspace');
  }

  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  // We can be pretty sure this'll be RootDocument as Document is converted to RootDocument when a pad is opened
  const doc = await exportNotebookContent<RootDocument>(padId);

  const { verbalized } = verbalizeDoc(
    doc,
    getRemoteComputer(),
    DOC_FILTER_ITEMS
  );

  const verbalizedDoc = verbalized.map((v) => v.verbalized).join('\n');

  const { body: requestBodyRaw } = event;
  let requestBodyString: string;

  if (event.isBase64Encoded && requestBodyRaw) {
    requestBodyString = Buffer.from(requestBodyRaw, 'base64').toString('utf8');
  } else if (requestBodyRaw) {
    requestBodyString = requestBodyRaw;
  } else {
    throw Boom.badRequest(`Missing request body`);
  }

  const payload = JSON.parse(requestBodyString);

  const { currentName } = payload;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `
              This is the existing Decipad notebook:
              ${verbalizedDoc}
            `,
      },
      {
        role: 'user',
        content: `
              This is the current name of the variable:
              ${currentName}
            `,
      },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
    max_tokens: 150,
  });

  await resourceusage.updateWorkspaceAndUserAi({
    userId: user.id,
    workspaceId,
    usage: completion.usage,
  });

  track(event, {
    event: `ApiNameLambda-generate-names`,
    userId: user.id,
    properties: {
      padId,
      promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
      completionTokensUsed: completion.usage?.completion_tokens ?? 0,
    },
  });

  const { message } = completion.choices[0];

  const [newPrompt, newCompletion] = await resourceusage.getAiTokens(
    'workspaces',
    workspaceId
  );

  const response = {
    message,
    usage: {
      promptTokensUsed: newPrompt,
      completionTokensUsed: newCompletion,
    },
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(response),
  };
});
