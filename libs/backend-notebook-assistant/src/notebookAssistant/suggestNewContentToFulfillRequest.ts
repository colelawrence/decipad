/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import stringify from 'json-stringify-safe';
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessage,
} from 'openai/resources/chat';
import {
  AnyElement,
  Document,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { getDefined } from '../../../utils/src';
import { codeAssistant } from '@decipad/backend-code-assistant';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import { debug } from '../debug';
import { introTemplate, afterBlocksTemplate, schema } from '../config';
import { getOpenAI } from '../utils/openAi';
import { createComputationalSummary } from '../utils/createComputationalSummary';
import { parseJSONResponse } from '../utils/parseJSONResponse';
import { applyCommands } from '../utils/applyCommands';
import { commandSchema } from '../config/commandSchema';
import { getRelevantBlockIds } from '../utils/getRelevantBlockIds';
import { getElements } from '../utils/getElements';
import { instructionSummaries, getInstructions } from '../config/instructions';
import { parseInstructionConstituents } from '../utils/parseInstructionConstituents';

export interface SuggestNewContentReply {
  newDocument: Document;
  summary: string;
}

// TODO: we still have issues when individualizing elements from deeply nested structures
const problematicBlockTypes = new Set([ELEMENT_VARIABLE_DEF, ELEMENT_TABLE]);

export const suggestNewContentToFulfillRequest = async (
  content: Document,
  request: string
): Promise<SuggestNewContentReply> => {
  debug('suggestNewContentToFulfillRequest', content, request);
  const openAi = getOpenAI();

  const verbalizedDocument = verbalizeDoc(content);
  // const computationalSummary = createComputationalSummary(content);
  const intro = (await introTemplate.invoke({})).toString();

  let messages: ChatCompletionMessage[] = [
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

Given the following index of instructions:

\`\`\`json
${JSON.stringify(instructionSummaries, null, '\t')}
\`\`\`

Which instructions would you need to fulfil my request?
Only reply with a single JSON array with the keys, nothing else.
Example of a reply: \`["code-lines", "table-formulas"]\`.
No comments.`,
    },
  ];

  let maxIterations = 7;
  let done = false;
  let relevantBlockIds: undefined | string[];
  let shouldJumpOverSpecificElementIds = false;
  let specificElementIds: undefined | string[];
  let changesSummary: undefined | string;
  let failedCode = false;
  let triedCode = false;
  let instructions: undefined | string;
  let reply: ChatCompletionMessage;

  const generateChatCompletion = async () => {
    const makeFunctionsAvailable =
      changesSummary != null &&
      specificElementIds != null &&
      !failedCode &&
      !triedCode;
    const createOptions: ChatCompletionCreateParamsNonStreaming = {
      messages,
      model: openAi.model,
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
    return openAi.client.chat.completions.create(createOptions);
  };

  const parseInstructions = () => {
    try {
      instructions = getInstructions(
        parseInstructionConstituents(
          getDefined(
            reply.content,
            'no reply content for parsing instruction keys'
          )
        )
      );
    } catch (err) {
      messages.push({
        role: 'user',
        content: `I had the following error: "${(err as Error).message}".
Reply in JSON only, no comments. Don't apologize.`,
      });
    }
  };

  const sendInstructionsForRelevantBlocks = () => {
    messages.push({
      role: 'user',
      content: `Given the document block list I gave you earlier, what would be the individual JSON blocks you would need to fulfil this request?
      Reply with a JSON array that contains the ids (as sole strings) of the blocks you would need.
      Reply with valid JSON only.
      If you wouldn't need any block to fulfil the user request (like when a user asks to add a block), reply with an empty JSON array.
      Only reply with a single JSON array, nothing else.
      No comments.`,
    });
  };

  const parseRelevantBlockIds = async () => {
    debug('parseRelevantBlockIds', reply);
    try {
      relevantBlockIds = getRelevantBlockIds(
        getDefined(
          reply.content,
          'no reply content for parsing relevant block ids'
        )
      );
    } catch (err) {
      messages.push({
        role: 'user',
        content: `I had the following error: "${(err as Error).message}".
Reply in JSON only, no comments. Don't apologize.`,
      });
    }
  };

  const isProblematicBlock = (element: AnyElement): boolean => {
    return problematicBlockTypes.has(element.type);
  };

  const sendRelevantBlocks = async () => {
    const relevantBlocks = verbalizedDocument.verbalized
      .filter((v) => getDefined(relevantBlockIds).includes(v.element.id))
      .map((v) => v.element);
    if (relevantBlocks.find(isProblematicBlock)) {
      shouldJumpOverSpecificElementIds = true;

      const newInstructions = (
        await afterBlocksTemplate.invoke({
          instructions: getDefined(instructions, 'no instructions'),
          schema,
          commandSchema,
        })
      ).toString();
      messages.push({ role: 'system', content: newInstructions });
    }
    const finalInstructions = shouldJumpOverSpecificElementIds
      ? `Reply with a list of JSON commands of the given Command type that strictly makes the following changes to my doc: ${JSON.stringify(
          request
        )}.
Only reply with a single JSON array, nothing else.
No comments.`
      : `Reply with a JSON list of element ids (root or inner) you would need to satisfy to make the following changes to my doc: ${JSON.stringify(
          request
        )}.

What would be the minimum individual JSON elements you would need to fulfil this request?
Reply with a JSON array that contains the ids (as sole strings) of the elements you would need.
Reply with valid JSON only.
If you wouldn't need any element to fulfil the user request (like when a user asks to add a block), reply with an empty JSON array.
Only reply with a single JSON array, nothing else.
No comments.
`;

    messages.push({
      role: 'user',
      content: `Here is the list of blocks from my document that you may need to change or remove:

\`\`\`json
${stringify(relevantBlocks, null, '\t')}
\`\`\`

${finalInstructions}`,
    });
  };

  const parseSpecificElementIds = async () => {
    debug('parseSpecificElementIds', reply);
    try {
      specificElementIds = getRelevantBlockIds(
        getDefined(
          reply.content,
          'no reply content for parsing specific element ids'
        )
      );
    } catch (err) {
      messages.push({
        role: 'user',
        content: `I had the following error: "${(err as Error).message}".
Please reply in JSON only, no comments. Don't apologize.`,
      });
    }
  };

  const sendSpecificElements = async () => {
    const newInstructions = (
      await afterBlocksTemplate.invoke({
        instructions: getDefined(instructions, 'no instructions'),
        schema,
        commandSchema,
      })
    ).toString();
    messages.push({ role: 'system', content: newInstructions });

    const relevantElements = getElements(content, new Set(specificElementIds));
    messages.push({
      role: 'user',
      content: `Here is the list of elements from my document that you may need to change or remove:

\`\`\`json
${stringify(relevantElements, null, '\t')}
\`\`\`

Let's pretend you had done the changes to my doc I request here: ${JSON.stringify(
        request
      )}
Give me a textual summary of the changes you have made in simple terms.`,
    });
  };

  const parseChangesSummary = (): void => {
    if (!reply.content) {
      throw new Error('Reply with a summary of changes in markdown.');
    }
    changesSummary = reply.content;
  };

  const sendFinalReplyInstructions = async (): Promise<void> => {
    messages.push({
      role: 'user',
      content: `Reply with a list of commands of the given Command type that strictly makes the following changes to my doc: ${JSON.stringify(
        request
      )}.
Only reply with a single JSON array, nothing else.
No comments.`,
    });
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
      const codeSnippet = await codeAssistant({
        summary: createComputationalSummary(content),
        prompt: codePrompt,
      });
      debug('code snippet:', codeSnippet);
      if (codeSnippet) {
        messages.push({
          role: 'function',
          content: codeSnippet,
          name: reply.function_call.name,
        } as ChatCompletionMessage);
      } else {
        failedCode = true;
        if (reply.content && relevantBlockIds != null) {
          done = true;
        }
        debug('code was not valid');
      }
    } else {
      failedCode = true;
      if (reply.content && relevantBlockIds != null) {
        done = true;
      }
    }
  };

  const resetMessages = () => {
    messages = [
      {
        role: 'system',
        content: intro,
      },
    ];
  };

  const generateFinalReply = (): SuggestNewContentReply | undefined => {
    const response = getDefined(reply?.content, 'no reply');
    debug('suggestNewContentToFulfillRequest: response:', response);

    try {
      const finalDoc = applyCommands(content, response);
      debug('finalDoc', finalDoc);
      return {
        newDocument: finalDoc,
        summary: getDefined(changesSummary),
      };
    } catch (err) {
      done = false;
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
    messages.push(reply);
    debug('Reply:', reply);

    if (!instructions) {
      parseInstructions();
      await sendInstructionsForRelevantBlocks();
      continue;
    }

    if (!relevantBlockIds) {
      await parseRelevantBlockIds();
      resetMessages();
      await sendRelevantBlocks();
      continue;
    }
    if (!specificElementIds) {
      if (!shouldJumpOverSpecificElementIds) {
        await parseSpecificElementIds();
        await sendSpecificElements();
        continue;
      } else {
        specificElementIds = relevantBlockIds;
      }
    }

    if (!changesSummary) {
      await parseChangesSummary();
      await sendFinalReplyInstructions();
      continue;
    }

    if (reply.function_call) {
      await makeFunctionCall();
    } else if (
      specificElementIds ||
      (shouldJumpOverSpecificElementIds && relevantBlockIds)
    ) {
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
