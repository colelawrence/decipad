import stringify from 'json-stringify-safe';
import { handleRequest } from '@decipad/discord-customerservice-lambda';
import handle from '../handle';

export const handler = handle(async (event) => {
  const response = await handleRequest(event);

  return {
    statusCode: 200,
    body: response ? stringify(response) : undefined,
  };
});
