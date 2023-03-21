/* eslint-disable import/no-import-module-exports */
import { expectAuthenticated } from '@decipad/services/authentication';
import { attachmentUrl } from '@decipad/services/blobs/attachments';
import { createImageAttachment } from '@decipad/services/images';
import { getDefined } from '@decipad/utils';

import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';

const notebooks = resource('notebook');

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const [{ user }] = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('missing parameters');
  }
  const padId = getDefined(event.pathParameters.padid);
  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  if (!event.body) {
    throw Boom.badRequest('no image uploaded');
  }

  const attachment = await createImageAttachment(user.id, padId, {
    headers: event.headers,
    body: event.body,
  });

  return {
    statusCode: 200,
    body: attachmentUrl(padId, attachment.id),
    headers: {
      'content-type': 'text/plain',
    },
  };
});
