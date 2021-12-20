import {
  APIApplicationCommand,
  APIInteractionResponse,
  InteractionResponseType,
} from 'discord-api-types/v9';
import fetch from 'isomorphic-fetch';
import handle from '../handle';
import { validate } from './validate';

async function replyToCommand(command: any) {
  const interactionId = command.id;
  const interactionToken = command.token;
  const url = `https://discord.com/api/v8/interactions/${interactionId}/${interactionToken}/callback`;
  const reply = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      tts: false,
      content: 'hey',
      embeds: [],
      allowed_mentions: { parse: [] },
    },
  };

  console.log('replying to %s with', url, reply);

  await fetch(url, { method: 'POST', body: JSON.stringify(reply) });
}

async function handleRequest(
  request: APIApplicationCommand
): Promise<APIInteractionResponse | void> {
  switch (request.type) {
    case 1: {
      // Ping
      return {
        type: 1,
      };
    }
    case 2:
    case 3: {
      await replyToCommand(request);
      break;
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
    body: response && JSON.stringify(response),
  };
});
