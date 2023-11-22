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
import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from 'openai/resources';
import { AIMode } from 'libs/editor-components/src/EditorAssistantChat/types';

interface ModePossibility {
  conversation: number;
  modelling: number;
}

export const DEFAULT_AUTO_MODE_SYSTEM_PROMPT = `
You are responsible for determining intent of the user message.
Your only to options are 'conversation' and 'modelling'.
Conversation is when user is asking a question, making a statement or asking for help, implying they need to be asked follow-up questions, or you don't have sufficient information to suggest modelling.
Modelling is when user is making a change to the document, implying they don't need to be asked follow-up questions.
Respond with a valid JSON that represents chance of each intent.
Make sure JSON is valid and can be parsed by JSON.parse().
Example: { "conversation": 0.8, "modelling": 0.2 }
`;

export const DEFAULT_ASK_MODE_SYSTEM_PROMPT = `
Be fun and more human in your responses.
You are a chatbot inside Decipad prodcut.
You have access to markdown representation of a document user is working on.
Ask follow-up questions to get more information about what user is trying to do.
Keep your answers short and to the point.
Respond only in natural human language.
Answers questions and provide useful information about the document.
Answer general questions if asked.
`;

export const DEFAULT_CREATE_MODE_SYSTEM_PROMPT = `
Generate variable names only in PascalCase. Example: MyVariableName
If no function should be called respond with a short message indicating what you have done and asking for future instructions.
Be fun and more human in your responses if no function should be called.
`;

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

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

  const { messages } = payload;
  // get the agent mode from messages
  try {
    const verablizedDocMsg: ChatCompletionMessageParam = {
      role: 'user',
      content: `
        This is the existing Decipad notebook:
        ${verbalizedDoc}
      `,
    };

    const modeCompletion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: DEFAULT_AUTO_MODE_SYSTEM_PROMPT,
        },
        verablizedDocMsg,
        ...messages,
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 100,
    });

    const msgContent = modeCompletion.choices[0].message.content;
    const parsedContent: ModePossibility = JSON.parse(msgContent || '{}');

    let mode: AIMode = 'ask';
    if (parsedContent.conversation >= 0.5) {
      mode = 'ask';
    } else if (parsedContent.modelling >= 0.5) {
      mode = 'create';
    } else {
      mode = 'ask';
    }

    let message: ChatCompletionMessage;
    if (mode === 'ask') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: DEFAULT_ASK_MODE_SYSTEM_PROMPT,
          },
          verablizedDocMsg,
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 800,
      });
      message = completion.choices[0].message;
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: DEFAULT_CREATE_MODE_SYSTEM_PROMPT,
          },
          verablizedDocMsg,
          ...messages,
        ],
        functions,
        temperature: 0.1,
        max_tokens: 800,
      });

      message = completion.choices[0].message;
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode, message }),
    };
  } catch (e: any) {
    console.log(e);
    throw Boom.internal(e.message);
  }
});
