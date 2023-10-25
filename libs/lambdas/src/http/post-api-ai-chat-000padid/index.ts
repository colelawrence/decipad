import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { exportNotebookContent } from '@decipad/services/notebooks';
import { valuesToMarkdown } from '@decipad/editor-utils';
import { RootDocument } from '@decipad/editor-types';

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

const systemPrompt = `You are an assistant who helps the user by making changes to their document.

If you are unclear about the user's instructions you should ask a follow-up question to clarify.

If it sounds like the user is asking for a change to the document, and you understand what they are asking for, then call the \`make_changes\` function.

The first message from the user is a markdown document that is the context for all future requests.

Do not call any function other than \`make_changes\``;

const systemMessageParam: ChatCompletionMessageParam = {
  role: 'system',
  content: systemPrompt,
};

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

  let stringifiedDoc: string;
  try {
    const [title, ...tabs] = doc.children;

    stringifiedDoc = `{
  title: ${JSON.stringify(title)},
  tabs: [
    ${tabs
      .map((tab): string => {
        return `    {
      name: ${tab.name},
      content: \`${valuesToMarkdown(tab.children)}\`
    }`;
      })
      .join('\n')}
  ]
}`;
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
  let messages: ChatCompletionMessageParam[];
  try {
    messages = JSON.parse(requestBodyString);
  } catch (e) {
    throw Boom.internal('Request body not valid JSON.');
  }

  messages.unshift({
    role: 'user',
    content: stringifiedDoc,
  });
  messages.unshift(systemMessageParam);

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages,
    functions: [
      {
        name: 'make_changes',
        description:
          "Call this function to proceed with making changes to the user's document.",
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
    temperature: 0.3,
    max_tokens: 2500,
  });

  const { message } = completion.choices[0];
  if (!message) {
    throw Boom.internal(`Failed to generate a response`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  };
});
