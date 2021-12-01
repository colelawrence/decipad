import * as Interactions from 'discord-api-types/payloads/v9/interactions';
import handle from '../handle';
import { validate } from './validate';

async function handleRequest(
  request: Interactions.APIApplicationCommand
): Promise<Interactions.APIInteractionResponse> {
  switch (request.type) {
    case 1: {
      // Ping
      return {
        type: 1,
      };
    }
    case 2:
    case 3: {
      // Message
      return {
        type: 4,
        data: {
          content: 'hey',
        },
      };
    }
    default: {
      throw new Error(
        `Don't know how to handle request of type ${request.type}`
      );
    }
  }
}

export const handler = handle(async (event) => {
  const request = (await validate(event)) as Interactions.APIApplicationCommand;
  const response = await handleRequest(request);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
});
