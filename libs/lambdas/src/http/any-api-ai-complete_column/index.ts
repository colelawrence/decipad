import { OpenAI } from 'openai';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import zip from 'lodash.zip';
import handle from '../handle';
import { captureException } from '@decipad/backend-trace';

const openai = new OpenAI({
  apiKey: thirdParty().openai.apiKey,
});

const createUserMessageContent = (table: string, columnName: string) => {
  return `\`\`\`
${table}
\`\`\`

Suggest a completion for ${columnName} that is just an array of strings.
`;
};

type RequestBody = {
  table: { cells: string[]; rowId: string }[];
  headerArray: string[];
  columnName: string;
  columnIndex: number;
};

export const handler = handle(async (event) => {
  const { body: requestBodyRaw } = event;
  let requestBodyString: string;

  if (event.isBase64Encoded && requestBodyRaw) {
    requestBodyString = Buffer.from(requestBodyRaw, 'base64').toString('utf8');
  } else if (requestBodyRaw) {
    requestBodyString = requestBodyRaw;
  } else {
    throw Boom.notFound(`Missing request body`);
  }

  let requestBody: RequestBody;
  try {
    requestBody = JSON.parse(requestBodyString);
  } catch (e) {
    throw Boom.badData('Request body is not valid JSON');
  }

  if (
    typeof requestBody.columnName === 'string' &&
    typeof requestBody.columnIndex === 'number' &&
    Array.isArray(requestBody.headerArray) && // headerArray is an array
    requestBody.headerArray.every((s) => typeof s === 'string') && // headerArray is array of strings
    Array.isArray(requestBody.table) && // table is an array
    requestBody.table.every((row) => {
      return (
        typeof row.rowId === 'string' &&
        Array.isArray(row.cells) &&
        row.cells.every((cell) => typeof cell === 'string')
      );
    }) // table array has right contents
  ) {
    // ^ I didn't want to write all of these as negatives so this is empty
  } else {
    throw Boom.badData('Request body has wrong format');
  }

  const { table, columnName, headerArray } = requestBody;

  // convert table into string
  let tableString = '';

  tableString = headerArray
    .map((header, i) => {
      if (header === columnName) {
        return [header, '/* completion */'];
      }
      const column = table
        .map((row) => row.cells[i])
        .filter((c) => c.trim() !== '');
      return [header, column];
    })
    .filter(([, column]) => column.length > 0)
    .map(
      ([header, column]) =>
        `\t"${header}": ${
          typeof column === 'string' ? column : JSON.stringify(column)
        }`
    )
    .join(',\n');

  tableString = `const table = {\n${tableString}\n}`;

  const userMessageContent = createUserMessageContent(tableString, columnName);

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages: [
      {
        role: 'system',
        content:
          'You use your judgement to create sensible completions for table data, if you think you have a completion then submit it with the `submit_completion` button. The completion must be a simple array of strings. ',
      },
      {
        role: 'user',
        content: userMessageContent,
      },
    ],
    functions: [
      {
        name: 'submit_completion',
        description:
          'Call this function to submit sensible suggestions for column completion',
        parameters: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: [columnName],
        },
      },
    ],
    temperature: 0,
    max_tokens: 1000,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const { message } = completion.choices[0];
  if (!message || !message.function_call) {
    throw new Error('ChatGPT call failed.');
  }
  const argString = message.function_call.arguments;
  let parsedArgs: { suggestions: string[] };
  try {
    parsedArgs = JSON.parse(argString as string);
  } catch (e) {
    const err = new Error(
      `Badly formed ChatGPT response to submit_completion (not parseable JSON): \n\n${argString}`
    );

    captureException(err);
    throw err;
  }

  if (
    !parsedArgs.suggestions ||
    !parsedArgs.suggestions.every((s) => typeof s === 'string')
  ) {
    const err = new Error(
      `Badly formed ChatGPT response to submit_completion: \n\n${JSON.stringify(
        parsedArgs,
        null,
        2
      )}`
    );

    captureException(err);
    throw err;
  }

  type Row = {
    cells: string[];
    rowId: string;
  };
  type Pair = [string | undefined, Row | undefined];
  type StrictPair = [string, Row];

  // We're being very permissive here. If the lengths of the suggestion and table arrays aren't
  // the same we naively match as many as we can and discard the rest.
  const indexedSuggestions = zip(parsedArgs.suggestions, requestBody.table)
    .filter((pair: Pair): pair is StrictPair => !pair.includes(undefined))
    .map(([suggestion, row]) => {
      return {
        id: row.rowId,
        suggestion,
        columnIndex: requestBody.columnIndex,
      };
    });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(indexedSuggestions),
  };
});
