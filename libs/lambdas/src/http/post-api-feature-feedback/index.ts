import Boom from '@hapi/boom';

import { expectAuthenticated } from '@decipad/services/authentication';

import handle from '../handle';
import { thirdParty } from '@decipad/backend-config';
import fetch from 'node-fetch';
import FormData from 'form-data';

export interface FeedbackObject {
  message: string;
  email: string;
  feature: string;
}

const DISCORD_API_URL = 'https://discord.com/api/webhooks';

const CHANNEL_TOKEN = thirdParty().discord.channelToken;
const CHANNEL_ID = thirdParty().discord.channelId;

const transformToDiscordMessage = (data: FeedbackObject) => {
  const { message, email, feature } = data;

  const discordMessage = [
    `:tada: New feedback submitted from **${email}**`,
    feature ? `**Feature**: ${feature}` : '',
    message ? `**Message**: ${message}` : '',
  ].join('\n');

  return discordMessage;
};

export const handler = handle(async (event) => {
  await expectAuthenticated(event);

  let { body } = event;

  if (!body) {
    throw Boom.notAcceptable('Missing request body');
  }
  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString('utf-8');
  }

  async function sendMessage(data: FeedbackObject, webhookUrl: string) {
    const formData = new FormData();

    formData.append('content', transformToDiscordMessage(data));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(
        `Failed to send message. Status: ${response.status}. Body: ${responseBody}`
      );
      throw Boom.internal(
        `Failed to send message. Status: ${response.status}. Body: ${responseBody}`
      );
    }
  }

  const data: FeedbackObject = JSON.parse(body);
  const url = `${DISCORD_API_URL}/${CHANNEL_ID}/${CHANNEL_TOKEN}`;

  await sendMessage(data, url);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Feedback sent' }),
  };
});
