import Boom from '@hapi/boom';

import { expectAuthenticated } from '@decipad/services/authentication';

import handle from '../handle';
import { thirdParty } from '@decipad/backend-config';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { Message } from '@decipad/react-contexts';
import { nanoid } from 'nanoid';
import { User } from '@decipad/interfaces';

export interface FeedbackObject {
  rating?: 'like' | 'dislike';
  message?: string;
  history: Message[];
  user?: User;
}

const DISCORD_API_URL = 'https://discord.com/api/webhooks';

const CHANNEL_TOKEN = thirdParty().discord.channelToken;
const CHANNEL_ID = thirdParty().discord.channelId;

const transformToDiscordMessage = (data: FeedbackObject) => {
  const { rating, message, user } = data;

  const ratingToEmoji = {
    like: 'Liked :thumbsup:',
    dislike: 'Disliked :thumbsdown:',
  };

  const discordMessage = [
    `:tada: New feedback submitted from **${user?.email ?? 'anonymous'}**`,
    rating ? `**Rating**: ${ratingToEmoji[rating]}` : '',
    message ? `**Message**: ${message}` : '',
    `Message history attached below :arrow_down:`,
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

  async function sendHistoryAttachment(
    history: Message[],
    webhookUrl: string,
    fileId: string
  ) {
    const filePath = `/tmp/history-${fileId}.json`;
    const fileContent = JSON.stringify(history, null, 2);

    console.log(`Writing notebook to ${filePath}`);
    console.log(fileContent);

    try {
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (e) {
      console.error(e);
      throw Boom.internal(`Failed to write notebook to file`);
    }

    const formData = new FormData();

    formData.append('file', fs.createReadStream(filePath), {
      filename: 'history.json',
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(
        `Failed to send notebook attachment. Status: ${response.status}. Body: ${responseBody}`
      );
      throw Boom.internal(
        `Failed to send notebook attachment. Status: ${response.status}. Body: ${responseBody}`
      );
    }

    fs.unlinkSync(filePath);
  }

  const data: FeedbackObject = JSON.parse(body);
  const url = `${DISCORD_API_URL}/${CHANNEL_ID}/${CHANNEL_TOKEN}`;
  const fileId = nanoid();

  await sendMessage(data, url);

  await sendHistoryAttachment(data.history, url, fileId);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Feedback sent' }),
  };
});
