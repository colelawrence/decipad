import {
  APIApplicationCommand,
  APIInteractionResponse,
  InteractionResponseType,
} from 'discord-api-types/v9';
import handle from '../handle';
import { validate } from './validate';

async function handleRequest(
  request: APIApplicationCommand
): Promise<APIInteractionResponse> {
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
        type: InteractionResponseType.ChannelMessageWithSource,
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
  const request = validate(event);
  const response = await handleRequest(request);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
});
