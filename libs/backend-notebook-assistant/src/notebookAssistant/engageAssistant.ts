import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty, app, limits } from '@decipad/backend-config';
import { exportNotebookContent } from '@decipad/services/notebooks';
import { RootDocument } from '@decipad/editor-types';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from 'openai/resources';
import { track } from '@decipad/backend-analytics';
import { User } from '@decipad/backendtypes';
import tables, {
  COMPLETION_TOKENS_USED,
  PROMPT_TOKENS_USED,
  getResources,
  isPremiumWorkspace,
  updateWorkspaceAndUserResourceUsage,
} from '@decipad/tables';
import { openApiSchema } from '@decipad/notebook-open-api';
import { getRemoteComputer } from '@decipad/remote-computer';
import {
  CONVERSATION_SYSTEM_PROMPT,
  CREATION_SYSTEM_PROMPT,
  FETCH_DATA_SYSTEM_PROMPT,
  MODE_DETECTION_PROMPT,
} from './constants';
import { resource } from '@decipad/backend-resources';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

const GPT_MODEL = 'gpt-4-1106-preview';

const isDevOrStaging =
  app().urlBase.includes('staging.decipad.com') ||
  app().urlBase.includes('dev.decipad.com') ||
  app().urlBase.includes('localhost');

function isTesting(workspaceName: string) {
  return workspaceName.includes('testing-ai-limits');
}

function getEmailDomain(email: string): string | undefined {
  return email.split('@').at(-1);
}

function isInternalEmail(email: string | null | undefined): boolean {
  if (email == null) return false;
  const domain = getEmailDomain(email);
  if (!domain) return false;

  return domain === 'decipad.com' || domain === 'n1n.co';
}

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

export interface EngageAssistantParams {
  notebookId: string;
  messages: ChatCompletionMessage[];
  user: User;
  event: APIGatewayProxyEventV2;
  forceMode: string;
}

export interface ChatUsage {
  promptTokensUsed: number;
  completionTokensUsed: number;
}

export interface EngageAssistantResponse {
  mode: string;
  message: ChatCompletionMessage;
  usage: ChatUsage;
}

// eslint-disable-next-line complexity
export const engageAssistant = async ({
  notebookId,
  messages,
  user,
  event,
  forceMode,
}: EngageAssistantParams): Promise<EngageAssistantResponse> => {
  const { pads, workspaces } = await tables();
  const workspaceId = (await pads.get({ id: notebookId }))?.workspace_id;

  if (!workspaceId) {
    throw Boom.badRequest('AI cannot be used on a pad without workspace');
  }

  const workspaceName = (await workspaces.get({ id: workspaceId }))?.name;
  if (!workspaceName) {
    throw Boom.badRequest('Workspace has no name');
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
  const internalEmail = isInternalEmail(user.email);
  const isN1NEmail = user.email && getEmailDomain(user.email) === 'n1n.co';

  const workspaceTotalTokensUsed =
    (promptTokens?.consumption ?? 0) + (completionTokens?.consumption ?? 0);

  const limit = limits().openAiTokensLimit[isPremium ? 'pro' : 'free'];

  //
  // Lets not have limits for dev/staging with n1n.co workspace names.
  // Let's also not limit "internal" emails. Look at `isInternalEmail`.
  //
  if (isDevOrStaging) {
    if (
      isTesting(workspaceName) &&
      !isN1NEmail &&
      workspaceTotalTokensUsed > limit
    ) {
      throw Boom.tooManyRequests("You've exceeded AI quota");
    }
  } else if (!internalEmail && workspaceTotalTokensUsed > limit) {
    throw Boom.tooManyRequests("You've exceeded AI quota");
  }

  await notebooks.expectAuthorized({
    user,
    recordId: notebookId,
    minimumPermissionType: 'READ',
  });

  // We can be pretty sure this'll be RootDocument as Document is converted to RootDocument when a pad is opened
  const doc = await exportNotebookContent<RootDocument>(notebookId);

  let verbalizedDoc: string;
  let idMapping: string;

  try {
    const { verbalized } = verbalizeDoc(doc, getRemoteComputer());

    verbalizedDoc = verbalized.map((v) => v.verbalized).join('\n');
    idMapping = verbalized
      .filter((v) => v.varName)
      .map(
        (v) =>
          `Variable with name \`${v.varName}\` has elementId \`${v.element.id}\``
      )
      .join('\n');
  } catch (e) {
    throw Boom.internal('Unable to parse document');
  }

  const userMessage = messages.at(-1);

  if (!userMessage) {
    throw Boom.notFound('Missing user message');
  }

  let mode;

  if (!forceMode) {
    const modeCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
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
        padId: notebookId,
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

    mode = getKeyOfMaxValue(parsedContent);
  } else {
    mode = forceMode;
  }

  let message: ChatCompletionMessage;

  const docMessage: ChatCompletionMessageParam = {
    role: 'system',
    content: `This the current document: \n ${verbalizedDoc}`,
  };

  const elementIdsMessage: ChatCompletionMessageParam = {
    role: 'system',
    content: `Don't expose this to the user, but here's the mapping of variable names to elementIds: \n ${idMapping}`,
  };

  if (mode === 'creation') {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: CREATION_SYSTEM_PROMPT,
        },
        ...messages,
        docMessage,
        elementIdsMessage,
      ],
      functions: openApiSchema,
      response_format: { type: 'json_object' },
      temperature: 0,
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
        padId: notebookId,
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
        ...messages,
        docMessage,
        elementIdsMessage,
      ],
      temperature: 0,
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
        padId: notebookId,
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
        ...messages,
        docMessage,
        elementIdsMessage,
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
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
        padId: notebookId,
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
    mode,
    message,
    usage: {
      promptTokensUsed: newPrompt?.consumption ?? 0,
      completionTokensUsed: newCompletion?.consumption ?? 0,
    },
  };
};
