import { Buffer } from 'buffer';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
} from 'aws-lambda';
import Boom from '@hapi/boom';
import nacl from 'tweetnacl';
import { APIApplicationCommand } from 'discord-api-types/payloads/v9/interactions';
import { discord, discord as discordConfig } from '@decipad/config';
import { getHeader } from '../get-header';

function validateRequestHeaders(
  body: string,
  headers: APIGatewayProxyEventHeaders
): void {
  const { publicKey } = discordConfig();
  if (!publicKey) {
    throw new Error('discord public key is not defined');
  }

  const signature = getHeader('X-Signature-Ed25519', headers);
  if (!signature) {
    throw Boom.badRequest('Need X-Signature-Ed25519 header');
  }
  const timestamp = getHeader('X-Signature-Timestamp', headers);
  if (!timestamp) {
    throw Boom.badRequest('Need X-Signature-Timestamp header');
  }

  const message = timestamp + body;
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(message),
    Buffer.from(signature, 'hex'),
    publicKey
  );

  if (!isVerified) {
    throw Boom.unauthorized('Invalid request signature');
  }
}

function validateRequest(request: APIApplicationCommand) {
  if (request.application_id !== discord().appId) {
    throw Boom.badRequest('Invalid app id');
  }
}

export function validate(event: APIGatewayProxyEvent): APIApplicationCommand {
  let { body } = event;
  if (!body) {
    throw Boom.badRequest('Need request body');
  }
  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString('utf-8');
  }

  validateRequestHeaders(body, event.headers);
  let request: APIApplicationCommand;
  try {
    request = JSON.parse(body);
    validateRequest(request);
  } catch (err) {
    console.error(err);
    throw Boom.badRequest('Error parsing request body');
  }
  if (!request) {
    throw Boom.badRequest('Need request body');
  }

  return request;
}
