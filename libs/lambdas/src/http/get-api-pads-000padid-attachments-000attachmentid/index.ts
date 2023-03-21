/* eslint-disable import/no-import-module-exports */
import { getURL } from '@decipad/services/blobs/attachments';
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { resource } from '@decipad/backend-resources';
import { getAuthenticatedUser } from '@decipad/services/authentication';
import tables from '@decipad/tables';
import handle from '../handle';

const notebooks = resource('notebook');

export const handler = handle(async (event: APIGatewayProxyEvent) => {
  const padId = event.pathParameters?.padid;
  if (!padId) {
    throw Boom.notAcceptable('missing parameters');
  }
  const user = await getAuthenticatedUser(event);
  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  const attachmentId = event.pathParameters?.attachmentid;
  if (!attachmentId) {
    return {
      statusCode: 400,
      body: 'Missing parameters',
    };
  }
  const data = await tables();
  const attachment = await data.fileattachments.get({ id: attachmentId });
  if (!attachment) {
    throw Boom.notFound('No such attachment');
  }
  if (attachment.resource_uri !== `/pads/${padId}`) {
    throw Boom.forbidden('Forbidden');
  }
  const url = await getURL(attachment.filename);
  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
});
