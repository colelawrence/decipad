/* eslint-disable import/no-import-module-exports */
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { attachmentUrl } from '@decipad/services/blobs/attachments';
import { createImageAttachment } from '@decipad/services/images';
import { getDefined } from '@decipad/utils';

import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import handle from '../handle';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const [{ user }] = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('missing parameters');
  }
  const padId = getDefined(event.pathParameters.padid);
  const resource = `/pads/${padId}`;
  await expectAuthorized({ resource, user, permissionType: 'WRITE' });

  const attachment = await createImageAttachment(user.id, padId, {
    headers: event.headers,
    body: getDefined(event.body),
  });

  return {
    statusCode: 200,
    body: attachmentUrl(padId, attachment.id),
    headers: {
      'content-type': 'text/plain',
    },
  };
});
