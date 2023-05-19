/* eslint-disable no-console */
import stringify from 'json-stringify-safe';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
} from 'discord-api-types/payloads/v9';
import fetch from 'isomorphic-fetch';
import { boomify, Boom } from '@hapi/boom';
import { validate } from './validate';
import { processCommand } from './process-command';
import type { Command, CommandReply } from './command';

function processError(error: Boom): CommandReply {
  console.error(error);
  const errorMessage = `Error processing request: ${
    error.output.payload.message
  }:
\`\`\`
${stringify(error.output.payload, null, '\t')}
\`\`\`
`;
  return {
    tts: false,
    content: errorMessage,
    embeds: [],
    allowed_mentions: { parse: [] },
  };
}

async function processAndReplyToCommand(command: Command) {
  let reply: CommandReply;
  try {
    reply = await processCommand(command);
  } catch (err) {
    reply = await processError(boomify(err as Error));
  }

  const interactionId = command.id;
  const interactionToken = command.token;
  const url = `https://discord.com/api/v8/interactions/${interactionId}/${interactionToken}/callback`;
  const response = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: reply,
  };

  const discordResponse = await fetch(url, {
    method: 'POST',
    body: stringify(response),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const responseText = await discordResponse.text();
  if (!discordResponse.ok) {
    throw new Error(
      `Discord response while trying to post reply message was: ${responseText}`
    );
  }
}

async function handleCommand(
  request: Command | APIInteraction
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
      await processAndReplyToCommand(request as Command);
      break;
    }
    default: {
      throw new Error(
        `Don't know how to handle request of type ${request.type}`
      );
    }
  }
}

export function handleRequest(
  event: APIGatewayProxyEvent
): Promise<APIInteractionResponse | void> {
  const command = validate(event);
  return handleCommand(command);
}
