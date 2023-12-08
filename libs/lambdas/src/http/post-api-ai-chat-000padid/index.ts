import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { app, thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';
import { exportNotebookContent } from '@decipad/services/notebooks';
import { RootDocument } from '@decipad/editor-types';

import { verbalizeDoc } from '@decipad/doc-verbalizer';
import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from 'openai/resources';

import { track } from '@decipad/backend-analytics';
import {
  OPEN_AI_PREMIUM_TOKENS_LIMIT,
  OPEN_AI_TOKENS_LIMIT,
} from '@decipad/backendtypes';
import {
  CONVERSATION_SYSTEM_PROMPT,
  CREATION_SYSTEM_PROMPT,
  FETCH_DATA_SYSTEM_PROMPT,
  MODE_DETECTION_PROMPT,
} from './constants';
import { RequestPayload } from './types';
import {
  COMPLETION_TOKENS_USED,
  PROMPT_TOKENS_USED,
  getResources,
  isPremiumWorkspace,
  updateWorkspaceAndUserResourceUsage,
} from './helpers';
import tables from '@decipad/tables';
import { openApiSchema } from '@decipad/notebook-open-api';
import { getRemoteComputer } from '@decipad/remote-computer';

const GPT_MODEL = 'gpt-4-1106-preview';

const notebooks = resource('notebook');

const isDevOrStaging =
  app().urlBase.includes('staging.decipad.com') ||
  app().urlBase.includes('dev.decipad.com') ||
  app().urlBase.includes('localhost');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

// eslint-disable-next-line complexity
export const handler = handle(async (event) => {
  const [{ user }] = await expectAuthenticated(event);

  if (!event.pathParameters) {
    throw Boom.notAcceptable('Missing path parameters');
  }
  const padId = event.pathParameters.padid;

  if (!padId) {
    throw Boom.notAcceptable('Missing pad ID parameter');
  }

  const { pads } = await tables();
  const workspaceId = (await pads.get({ id: padId }))?.workspace_id;

  if (!workspaceId) {
    throw Boom.badRequest('AI cannot be used on a pad without workspace');
  }

  const [promptTokens, completionTokens] = await getResources([
    {
      resource: 'openai',
      subType: GPT_MODEL,
      field: PROMPT_TOKENS_USED,
      consumer: 'workspaces',
      consumerId: workspaceId ?? '',
    },
    {
      resource: 'openai',
      subType: GPT_MODEL,
      field: COMPLETION_TOKENS_USED,
      consumer: 'workspaces',
      consumerId: workspaceId ?? '',
    },
  ]);

  const isPremium = await isPremiumWorkspace(workspaceId);

  const workspaceTotalTokensUsed =
    (promptTokens?.consumption ?? 0) + (completionTokens?.consumption ?? 0);

  const limit = isPremium ? OPEN_AI_PREMIUM_TOKENS_LIMIT : OPEN_AI_TOKENS_LIMIT;

  if (!isDevOrStaging && workspaceTotalTokensUsed > limit) {
    throw Boom.tooManyRequests("You've exceeded AI quota");
  }

  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  // We can be pretty sure this'll be RootDocument as Document is converted to RootDocument when a pad is opened
  const doc = await exportNotebookContent<RootDocument>(padId);

  let verbalizedDoc: string;
  let idMapping: string;

  try {
    const { verbalized } = verbalizeDoc(doc, getRemoteComputer());

    verbalizedDoc = verbalized.map((v) => v.verbalized).join('\n');
    idMapping = verbalized
      .filter((v) => v.varName)
      .map(
        (v) => `variable \`${v.varName}\` has element_id \`${v.element.id}\``
      )
      .join('\n');
  } catch (e) {
    throw Boom.internal('Unable to parse document');
  }

  const { body: requestBodyRaw } = event;

  let requestBodyString: string;

  if (event.isBase64Encoded && requestBodyRaw) {
    requestBodyString = Buffer.from(requestBodyRaw, 'base64').toString('utf8');
  } else if (requestBodyRaw) {
    requestBodyString = requestBodyRaw;
  } else {
    throw Boom.notFound(`Missing request body`);
  }

  const payload: RequestPayload = JSON.parse(requestBodyString);

  const { messages } = payload;

  const userMessage = messages.at(-1);

  if (!userMessage) {
    throw Boom.notFound('Missing user message');
  }

  const modeCompletion = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages: [
      {
        role: 'system',
        content: MODE_DETECTION_PROMPT,
      },
      userMessage,
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
    max_tokens: 100,
  });

  await updateWorkspaceAndUserResourceUsage({
    userId: user.id,
    workspaceId,
    aiModel: GPT_MODEL,
    tokensUsed: {
      promptTokensUsed: modeCompletion.usage?.prompt_tokens ?? 0,
      completionTokensUsed: modeCompletion.usage?.completion_tokens ?? 0,
    },
  });

  track(event, {
    event: `ApiChatLambda-mode:mode-choice`,
    userId: user.id,
    properties: {
      padId,
      promptTokensUsed: modeCompletion.usage?.prompt_tokens ?? 0,
      completionTokensUsed: modeCompletion.usage?.completion_tokens ?? 0,
    },
  });

  const modeObjectString = modeCompletion.choices[0].message.content;

  if (!modeObjectString) {
    throw Boom.internal('Unable to parse mode');
  }

  const parsedContent = JSON.parse(modeObjectString);

  // Helper to get key of max value in object
  const getKeyOfMaxValue = (obj: { [key: string]: number }) =>
    Object.entries(obj).reduce((maxEntry, currentEntry) =>
      currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry
    )[0];

  const mode = getKeyOfMaxValue(parsedContent);

  let message: ChatCompletionMessage;

  const docMessage: ChatCompletionMessageParam = {
    role: 'user',
    content: `This is my current document: \n ${verbalizedDoc}, `,
  };

  const elementIds: ChatCompletionMessageParam = {
    role: 'user',
    content: `Here is a list of variable names to the corresponding ID.
    Please don't ask me about them
    ${idMapping}`,
  };

  if (mode === 'creation') {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: CREATION_SYSTEM_PROMPT,
        },
        docMessage,
        elementIds,
        ...messages,
      ],
      functions: openApiSchema,
      temperature: 0.1,
      max_tokens: 1200,
    });

    await updateWorkspaceAndUserResourceUsage({
      userId: user.id,
      workspaceId,
      aiModel: GPT_MODEL,
      tokensUsed: {
        promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
        completionTokensUsed: completion.usage?.completion_tokens ?? 0,
      },
    });

    track(event, {
      event: `ApiChatLambda-mode:model`,
      userId: user.id,
      properties: {
        padId,
        promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
        completionTokensUsed: completion.usage?.completion_tokens ?? 0,
      },
    });
    message = completion.choices[0].message;
  } else if (mode === 'fetch_data') {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: FETCH_DATA_SYSTEM_PROMPT,
        },
        docMessage,
        elementIds,
        ...messages,
      ],
      temperature: 0.1,
      max_tokens: 800,
      stop: `\`\`\`\n`,
    });

    await updateWorkspaceAndUserResourceUsage({
      userId: user.id,
      workspaceId,
      aiModel: GPT_MODEL,
      tokensUsed: {
        promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
        completionTokensUsed: completion.usage?.completion_tokens ?? 0,
      },
    });

    track(event, {
      event: `ApiChatLambda-mode:fetch_data`,
      userId: user.id,
      properties: {
        padId,
        promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
        completionTokensUsed: completion.usage?.completion_tokens ?? 0,
      },
    });

    message = completion.choices[0].message;
    const tripleBacktickCount = message.content?.match('```')?.length || 0;
    const hasDanglingTripleBackticks = tripleBacktickCount % 2 === 1;
    message.content = `${message.content}${
      hasDanglingTripleBackticks ? '```' : ''
    }`;
  } else {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: CONVERSATION_SYSTEM_PROMPT,
        },
        docMessage,
        elementIds,
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    await updateWorkspaceAndUserResourceUsage({
      userId: user.id,
      workspaceId,
      aiModel: GPT_MODEL,
      tokensUsed: {
        promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
        completionTokensUsed: completion.usage?.completion_tokens ?? 0,
      },
    });

    track(event, {
      event: `ApiChatLambda-mode:ask`,
      userId: user.id,
      properties: {
        padId,
        promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
        completionTokensUsed: completion.usage?.completion_tokens ?? 0,
      },
    });
    message = completion.choices[0].message;
  }

  const [newPrompt, newCompletion] = await getResources([
    {
      resource: 'openai',
      subType: GPT_MODEL,
      field: PROMPT_TOKENS_USED,
      consumer: 'workspaces',
      consumerId: workspaceId ?? '',
    },
    {
      resource: 'openai',
      subType: GPT_MODEL,
      field: COMPLETION_TOKENS_USED,
      consumer: 'workspaces',
      consumerId: workspaceId ?? '',
    },
  ]);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode,
      message,
      usage: {
        promptTokensUsed: newPrompt?.consumption ?? 0,
        completionTokensUsed: newCompletion?.consumption ?? 0,
      },
    }),
  };
});
