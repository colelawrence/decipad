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
import { AIMode } from 'libs/editor-components/src/EditorAssistantChat/types';
import { tables } from '@decipad/tables';
import { track } from '@decipad/backend-analytics';
import { OPEN_AI_TOKENS_LIMIT } from '@decipad/backendtypes';
import {
  COMPLETION_TOKENS_USED,
  PROMPT_TOKENS_USED,
  getResources,
  updateWorkspaceAndUserResourceUsage,
} from './helpers';
import { debug } from '../../debug';
import { functions } from './functions';

interface ModePossibility {
  conversation: number;
  modelling: number;
}

const GPT_MODEL = 'gpt-4-1106-preview';

export const DEFAULT_AUTO_MODE_SYSTEM_PROMPT = `
You are responsible for determining intent of the user message.
Your only options are 'conversation', 'fetch_data' and 'modelling'.
Conversation is when user is asking a question, making a statement or asking for help, implying they need to be asked follow-up questions, or you don't have sufficient information to suggest modelling.
Modelling is when user is making a change to the document, implying they don't need to be asked follow-up questions.
Modelling is when the user is asking you to fetch data from an external API.
Respond with a valid JSON that represents chance of each intent.
Make sure JSON is valid and can be parsed by JSON.parse().
Example: { "conversation": 0.8, "modelling": 0.2 "fetch_data": 0.1}
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

export const DEFAULT_FETCH_DATA_MODE_SYSTEM_PROMPT = `
You are an AI, and a programmer who only knows JavaScript.
Your job is to create a function that uses a fetch request to get the data the user asks for.
The function should take any information you need (like IDs) as arguments.
Secret values like API keys already exist in \`proccess.env\`.
Your function should NEVER accept sensitive information like API keys as arguments.
You should use JSDoc comments to decribe the function's parameters.
You should think through the problem and then output the code in a single JavaScript codeblock at the END of your message.
You should return either a string, number, boolean, or table-like object. If the data is suitable for tabulation then you should process the data so that it is of the form:
{ 
  key1: [value1a, value1b],
  key2: [value2a, value2b],
}
Rather than
[
  {
    key1: value1a,
    key2: value2a,
  },
  {
    key1: value1b,
    key2: value2b,
  }
]

Here is an example conversation:

  User: can you get data on a stripe customer for me?

  AI: Sure, here's an integration to fetch stripe customer data:

  \`\`\`JavaScript
  /**
   * @param {string} customer_id The unique identifier for the customer in Stripe.
   */
  const getStripeCustomer = (customer_id) => {
    const response = await fetch(\`https://api.stripe.com/v1/customers/$\{customer_id}\`, {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer $\{process.env.stripeApiKey}\`
      }
    });


    return response.json();
  }
  \`\`\`

`;

const notebooks = resource('notebook');

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

const isProd = app().urlBase === 'https://app.decipad.com';

// eslint-disable-next-line complexity
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
  const { pads } = await tables();
  const workspaceId = (await pads.get({ id: padId }))?.workspace_id;

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

  const workspaceTotalTokensUsed =
    (promptTokens?.consumption ?? 0) + (completionTokens?.consumption ?? 0);

  if (workspaceTotalTokensUsed > OPEN_AI_TOKENS_LIMIT) {
    debug('Reminder: Not blocking users from usage!!!');
    // NOTE: For testing in DEV we won't block users from making requests.
    // CHANGE ME BEFORE GOING INTO PROD!!!
    if (isProd) {
      throw Boom.tooManyRequests("You've exceeded AI quota");
    }
  }

  let verbalizedDoc: string;
  let varnameToId: string;

  try {
    const { verbalized } = verbalizeDoc(doc);

    verbalizedDoc = verbalized.map((v) => v.verbalized).join('\n');

    varnameToId = verbalized
      .map((v) => [v.varName, v.element.id])
      .filter(([v]) => v != null)
      .join('\n');
  } catch (e) {
    throw Boom.internal('Unable to parse document');
  }

  const varnameToIdMessage: ChatCompletionMessageParam = {
    role: 'user',
    content: `
      This is a map between variable names and element IDs, use this to find out the element ID
      when you have a variable name.
      ${varnameToId}`,
  };

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
      model: GPT_MODEL,
      messages: [
        {
          role: 'system',
          content: DEFAULT_AUTO_MODE_SYSTEM_PROMPT,
        },
        verablizedDocMsg,
        varnameToIdMessage,
        ...messages,
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
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

    track({
      event: `ApiChatLambda-mode:mode-choice`,
      userId: user.id,
      properties: {
        padId,
        promptTokensUsed: modeCompletion.usage?.prompt_tokens ?? 0,
        completionTokensUsed: modeCompletion.usage?.completion_tokens ?? 0,
      },
    });

    const msgContent = modeCompletion.choices[0].message.content;
    const parsedContent: ModePossibility = JSON.parse(msgContent || '{}');

    let mode: AIMode = 'ask';
    if (parsedContent.conversation >= 0.5) {
      mode = 'ask';
      track({
        event: `ApiChatLambda-mode:ask`,
      });
    } else if (parsedContent.modelling >= 0.5) {
      mode = 'create';
      track({
        event: `ApiChatLambda-mode:create`,
      });
    } else {
      track({
        event: `ApiChatLambda-mode:fetch_data`,
      });
      mode = 'fetch_data';
    }

    let message: ChatCompletionMessage;
    switch (mode) {
      case 'ask': {
        const completion = await openai.chat.completions.create({
          model: GPT_MODEL,
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
        await updateWorkspaceAndUserResourceUsage({
          userId: user.id,
          workspaceId,
          aiModel: GPT_MODEL,
          tokensUsed: {
            promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
            completionTokensUsed: completion.usage?.completion_tokens ?? 0,
          },
        });

        track({
          event: `ApiChatLambda-mode:ask`,
          userId: user.id,
          properties: {
            padId,
            promptTokensUsed: modeCompletion.usage?.prompt_tokens ?? 0,
            completionTokensUsed: modeCompletion.usage?.completion_tokens ?? 0,
          },
        });
        message = completion.choices[0].message;
        break;
      }
      case 'create': {
        const completion = await openai.chat.completions.create({
          model: GPT_MODEL,
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

        await updateWorkspaceAndUserResourceUsage({
          userId: user.id,
          workspaceId,
          aiModel: GPT_MODEL,
          tokensUsed: {
            promptTokensUsed: completion.usage?.prompt_tokens ?? 0,
            completionTokensUsed: completion.usage?.completion_tokens ?? 0,
          },
        });

        track({
          event: `ApiChatLambda-mode:model`,
          userId: user.id,
          properties: {
            padId,
            promptTokensUsed: modeCompletion.usage?.prompt_tokens ?? 0,
            completionTokensUsed: modeCompletion.usage?.completion_tokens ?? 0,
          },
        });
        message = completion.choices[0].message;
        break;
      }
      case 'fetch_data': {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-1106-preview',
          messages: [
            {
              role: 'system',
              content: DEFAULT_FETCH_DATA_MODE_SYSTEM_PROMPT,
            },
            verablizedDocMsg,
            varnameToIdMessage,
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

        track({
          event: `ApiChatLambda-mode:fetch_data`,
          userId: user.id,
          properties: {
            padId,
            promptTokensUsed: modeCompletion.usage?.prompt_tokens ?? 0,
            completionTokensUsed: modeCompletion.usage?.completion_tokens ?? 0,
          },
        });

        message = completion.choices[0].message;
        const tripleBacktickCount = message.content?.match('```')?.length || 0;
        const hasDanglingTripleBackticks = tripleBacktickCount % 2 === 1;
        message.content = `${message.content}${
          hasDanglingTripleBackticks ? '```' : ''
        }`;
        break;
      }
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
  } catch (e: any) {
    console.log(e);
    throw Boom.internal(e.message);
  }
});
