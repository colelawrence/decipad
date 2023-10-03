/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import { Document } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { debug } from '../debug';
import {
  introTemplate,
  afterBlocksTemplate,
  instructions,
  schema,
} from '../config';
import { getOpenAI } from '../utils/openAi';
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessage,
} from 'openai/resources/chat';
import { codeAssistant } from '../codeAssistant/codeAssistant';
import stringify from 'json-stringify-safe';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import { createComputationalSummary } from '../utils/createComputationalSummary';
import { parseJSONResponse } from '../utils/parseJSONResponse';
import { applyCommands } from '../utils/applyCommands';
import { commandSchema } from '../config/commandSchema';
import { getRelevantBlockIds } from '../utils/getRelevantBlockIds';

export const suggestNewContentToFulfillRequest = async (
  content: Document,
  request: string
): Promise<Document> => {
  debug('suggestNewContentToFulfillRequest', content, request);
  const openAi = getOpenAI();

  const verbalizedDocument = verbalizeDoc(content);
  // const computationalSummary = createComputationalSummary(content);
  const intro = (await introTemplate.invoke({})).toString();

  const messages: ChatCompletionMessage[] = [
    {
      role: 'system',
      content: intro,
    },
    {
      role: 'user',
      content: `I have a document that contains the following blocks:

${stringify(
  verbalizedDocument.verbalized.map((v) => ({
    blockId: v.element.id,
    blockDescription: v.verbalized,
  })),
  null,
  ' '
)}

If I were to ask you to make the following modifications to this document:

${JSON.stringify(request)}

What would be the individual JSON blocks you would need to fulfil this request?
Please reply with a JSON array that contains the ids (as sole strings) of the blocks you would need.
Reply with valid JSON only.
If you wouldn't need any block to fulfil the user request (like when a user asks to add a block), reply with an empty JSON array.
Only reply with a single JSON array, nothing else.
No comments.
`,
    },
  ];

  let maxIterations = 5;
  let done = false;
  let haveRelevantBlockIds = false;
  let failedCode = false;
  let triedCode = false;
  let reply: ChatCompletionMessage;

  const generateChatCompletion = async () => {
    const makeFunctionsAvailable =
      haveRelevantBlockIds && !failedCode && !triedCode;
    const createOptions: ChatCompletionCreateParamsNonStreaming = {
      messages,
      model: 'gpt-3.5-turbo-16k',
      temperature: 0,
      functions: makeFunctionsAvailable
        ? [
            {
              name: 'generate_decilang_code',
              description:
                'generate a simple text expression of Decipad language from a description. NEVER use this to generate JSON.',
              parameters: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description:
                      'The textual description of the expression you need.',
                  },
                },
                required: ['description'],
              },
            },
          ]
        : undefined,
    };
    if (makeFunctionsAvailable) {
      createOptions.function_call = 'auto';
    }
    return openAi.chat.completions.create(createOptions);
  };

  const parseRelevantBlockIds = async () => {
    debug('parseRelevantBlockIds', reply);
    messages.push(reply);
    try {
      const relevantBlockIds = getRelevantBlockIds(
        getDefined(
          reply.content,
          'no reply content for parsing relevant block ids'
        )
      );

      haveRelevantBlockIds = true;
      messages.splice(0); // remove anything about getting the relevant blocks so we don't confuse the AI

      const newInstructions = (
        await afterBlocksTemplate.invoke({
          instructions,
          schema,
          commandSchema,
        })
      ).toString();
      messages.push({ role: 'system', content: newInstructions });

      const relevantBlocks = verbalizedDocument.verbalized
        .filter((v) =>
          (relevantBlockIds as Array<string>).includes(v.element.id)
        )
        .map((v) => v.element);
      messages.push({
        role: 'user',
        content: `Here is the list of blocks from my document that you may need to change:

\`\`\`json
${stringify(relevantBlocks, null, '\t')}
\`\`\`

Please reply with a list of commands that strictly makes the following changes to my doc: ${JSON.stringify(
          request
        )}.
`,
      });
    } catch (err) {
      messages.push({
        role: 'user',
        content: `I had the following error: "${(err as Error).message}".
Please reply in JSON only, no comments. Don't apologize.`,
      });
    }
  };

  const makeFunctionCall = async () => {
    if (reply?.function_call?.name === 'generate_decilang_code') {
      triedCode = true;
      const codePrompt = (
        parseJSONResponse(reply.function_call.arguments) as {
          description: string;
        }
      ).description;
      debug('code prompt: %j', codePrompt);
      const codeSnippet = await codeAssistant(
        createComputationalSummary(content),
        codePrompt
      );
      debug('code snippet:', codeSnippet);
      if (codeSnippet) {
        messages.push(reply);
        messages.push({
          role: 'function',
          content: codeSnippet,
          name: reply.function_call.name,
        } as ChatCompletionMessage);
      } else {
        failedCode = true;
        if (reply.content && haveRelevantBlockIds) {
          done = true;
        }
        debug('code was not valid');
      }
    } else {
      failedCode = true;
      if (reply.content && haveRelevantBlockIds) {
        done = true;
      }
    }
  };

  const generateFinalReply = (): Document | undefined => {
    const response = getDefined(reply?.content, 'no reply');
    debug('suggestNewContentToFulfillRequest: response:', response);

    try {
      const finalDoc = applyCommands(content, response);
      debug('finalDoc', finalDoc);
      return finalDoc;
    } catch (err) {
      done = false;
      messages.push(reply);
      messages.push({
        role: 'user',
        content: `${(err as Error).message}. No comments. Don't apologize.`,
      });
      done = false;
      // eslint-disable-next-line no-console
      console.error('Error parsing chat assistant output to JSON', err);
      // eslint-disable-next-line no-console
      console.error('text was', response);
    }
    return undefined;
  };

  while (!done && maxIterations > 0) {
    maxIterations -= 1;
    debug(`------------------- ITERATION -${maxIterations}`, messages);
    const result = await generateChatCompletion();
    reply = result.choices[0].message;

    if (!haveRelevantBlockIds) {
      await parseRelevantBlockIds();
      continue;
    }

    if (reply.function_call) {
      await makeFunctionCall();
    } else if (haveRelevantBlockIds) {
      done = true;
    }

    debug('RESULT %j', reply);

    if (done) {
      const shouldReturn = generateFinalReply();
      if (shouldReturn) {
        return shouldReturn;
      }
    }
  }

  return getDefined(generateFinalReply(), 'could not generate reply');
};
