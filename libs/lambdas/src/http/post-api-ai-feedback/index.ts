import Boom from '@hapi/boom';

import { expectAuthenticated } from '@decipad/services/authentication';

import handle from '../handle';
import { thirdParty } from '@decipad/backend-config';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { ElapsedEventTime, Feedback } from '@decipad/react-contexts';
import { nanoid } from 'nanoid';

export interface FeedbackObject {
  rating: 'like' | 'dislike';
  message: string;
  feedback: Feedback;
}

const DISCORD_API_URL = 'https://discord.com/api/webhooks';

const CHANNEL_TOKEN = thirdParty().discord.channelToken;
const CHANNEL_ID = thirdParty().discord.channelId;

const transformToDiscordMessage = (data: FeedbackObject) => {
  const { rating, message, feedback } = data;

  const ratingToEmoji = {
    like: ':thumbsup:',
    dislike: ':thumbsdown:',
  };

  const getTotalElapsedTime = (elapsed: ElapsedEventTime | undefined) => {
    if (!elapsed) {
      return 0;
    }
    return Object.values(elapsed).reduce((acc, curr) => acc + curr, 0);
  };

  const createElapsedTimeStrings = (elapsed: ElapsedEventTime | undefined) => {
    if (!elapsed) {
      return [];
    }
    return Object.entries(elapsed).map(([ev, time]) => {
      return `- ${ev}: \`${time}ms\` (${(
        (time / getTotalElapsedTime(elapsed)) *
        100
      ).toFixed(2)}%)`;
    });
  };

  const discordMessage = [
    `New feedback submitted :tada:`,
    `**Rating**: ${ratingToEmoji[rating]}`,
    `**Feedback Message**:`,
    `> ${message}`,
    `**Initial Prompt**: ${feedback.prompt}`,
    `**Errors**: ${feedback.error || 'No errors :white_check_mark:'}`,
    `**Changes Summary**:`,
    `> ${feedback.summary}`,
    `**Elapsed Time**:`,
    createElapsedTimeStrings(feedback.elapsed).join('\n'),
    '---',
    `Operations & notebook attached below :arrow_down:`,
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
      throw new Error(
        `Failed to send message. Status: ${response.status}. Body: ${responseBody}`
      );
    }
  }

  async function sendOperationsAttachment(
    operations: FeedbackObject['feedback']['operations'],
    webhookUrl: string,
    fileId: string
  ) {
    const filePath = `/tmp/operations-${fileId}.json`;
    const fileContent = JSON.stringify(operations, null, 2);

    try {
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (e) {
      throw new Error(`Failed to write operations to file`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: 'operations.json',
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(
        `Failed to send operations attachment. Status: ${response.status}. Body: ${responseBody}`
      );
      throw new Error(
        `Failed to send operations attachment. Status: ${response.status}. Body: ${responseBody}`
      );
    }

    fs.unlinkSync(filePath);
  }

  async function sendNotebookAttachment(
    notebook: FeedbackObject['feedback']['notebook'],
    webhookUrl: string,
    fileId: string
  ) {
    const filePath = `/tmp/notebook-${fileId}.json`;
    const fileContent = JSON.stringify(notebook, null, 2);

    try {
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (e) {
      throw new Error(`Failed to write notebook to file`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: 'notebook.json',
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
      throw new Error(
        `Failed to send notebook attachment. Status: ${response.status}. Body: ${responseBody}`
      );
    }

    fs.unlinkSync(filePath);
  }

  const data: FeedbackObject = JSON.parse(body);
  const url = `${DISCORD_API_URL}/${CHANNEL_ID}/${CHANNEL_TOKEN}`;
  const fileId = nanoid();

  try {
    await sendMessage(data, url);
  } catch (e) {
    throw Boom.internal(`Failed to send discord message:`, e);
  }

  try {
    await sendOperationsAttachment(data.feedback.operations, url, fileId);
  } catch (e) {
    throw Boom.internal(`Failed to send operations:`, e);
  }

  try {
    await sendNotebookAttachment(data.feedback.notebook, url, fileId);
  } catch (e) {
    throw Boom.internal(`Failed to send notebook:`, e);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Feedback sent' }),
  };
});
