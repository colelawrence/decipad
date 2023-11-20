import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';
import { exportNotebookContent } from '@decipad/services/notebooks';
import { RootDocument } from '@decipad/editor-types';
import { functions } from './functions';
import { verbalizeDoc } from '@decipad/doc-verbalizer';

import { AIMode } from '@decipad/react-contexts';

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

const isCreateMode = (mode: AIMode) => mode === 'create';
const isAutoMode = (mode: AIMode) => mode === 'auto';

export const handler = handle(async (event) => {
  const [{ user }] = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('missing parameters');
  }
  const padId = event.pathParameters.padid;
  if (!padId) {
    throw Boom.notAcceptable('missing parameter padid');
  }
  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  // We can be pretty sure this'll be RootDocument as Document is converted to RootDocument when a pad is opened
  const doc = await exportNotebookContent<RootDocument>(padId);

  let verbalizedDoc: string;

  try {
    const { verbalized } = verbalizeDoc(doc);

    verbalizedDoc = verbalized.map((v) => v.verbalized).join('\n');
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

  const payload = JSON.parse(requestBodyString);

  const { messages, agent, config } = payload;

  const callAgent = async () => {
    messages.unshift({
      role: 'user',
      content: `
        This is the existing Decipad notebook:
        ${verbalizedDoc}
      `,
    });
    messages.unshift({
      role: 'system',
      content: config.systemPrompt,
    });

    try {
      const completion = await openai.chat.completions.create({
        model: config.usePretrainedModel
          ? 'ft:gpt-3.5-turbo-0613:team-n1n-co::86fVKLap'
          : 'gpt-4-1106-preview',
        messages,
        functions: isCreateMode(agent) ? functions : undefined,
        response_format: { type: isAutoMode(agent) ? 'json_object' : 'text' },
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      });

      const { message } = completion.choices[0];

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      };
    } catch (e: any) {
      console.log(e);
      throw Boom.internal(e.message);
    }
  };

  return callAgent();
});
