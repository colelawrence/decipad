/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable unused-imports/no-unused-vars */
import { thirdParty } from '@decipad/backend-config';
import { resourceusage } from '@decipad/services';
import {
  expectAuthenticated,
  getAuthenticatedUser,
} from '@decipad/services/authentication';

import { track } from '@decipad/backend-analytics';
import { ReplicateModels } from '@decipad/shared-config';
import Boom from '@hapi/boom';
import Replicate from 'replicate';
import handle from '../handle';

const { apiKey } = thirdParty().replicate;

const replicate = new Replicate({
  auth: apiKey,
});

type RequestBody = {
  prompt: string;
  fn: string;
  workspaceId: string;
};

let model = ReplicateModels[0];

export const handler = handle(async (event) => {
  await expectAuthenticated(event);
  const user = await getAuthenticatedUser(event);

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
  } catch (_e) {
    throw Boom.badData('Request body is not valid JSON');
  }
  if (typeof requestBody.prompt !== 'string') {
    throw Boom.badData('Request body has wrong format. Expected a `prompt`');
  }
  if (typeof requestBody.fn !== 'string') {
    throw Boom.badData('Request body has wrong format. Expected a `fn`');
  }
  if (typeof requestBody.workspaceId !== 'string') {
    throw Boom.badData(
      'Request body has wrong format. Expected a `workspaceId`'
    );
  }

  const { prompt, fn, workspaceId } = requestBody;

  const matchingModel = ReplicateModels.find((m) => m.label === fn);
  if (matchingModel) {
    model = matchingModel;
  }

  const tokenPrice = model ? model.tokenPrice : 10_000;

  await resourceusage.ai.updateWorkspaceAndUser({
    userId: user?.id,
    workspaceId,
    usage: {
      completion_tokens: tokenPrice,
      prompt_tokens: 0,
      total_tokens: tokenPrice,
    },
  });

  const hasReachedLimit = await resourceusage.ai.hasReachedLimit(workspaceId);

  if (hasReachedLimit) {
    throw Boom.paymentRequired('You are out of AI credits');
  }

  track(event, {
    event: `ApiImage-replicate:generate`,
    userId: user?.id,
    properties: {
      workspaceId,
      promptTokensUsed: tokenPrice,
    },
  });

  const output = await replicate.run(
    model.model as `${string}/${string}` | `${string}/${string}:${string}`,
    {
      input: model.settings(prompt),
    }
  );

  if (!Array.isArray(output) || output.length < 1) {
    throw Boom.notFound(`Found no images`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: output,
    }),
  };
});
