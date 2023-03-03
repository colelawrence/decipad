/* eslint-disable import/no-import-module-exports */
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { getURL } from '@decipad/services/blobs/attachments';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import handle from '../handle';

export const handler = handle(async (event: APIGatewayProxyEvent) => {
  const padId = event.pathParameters?.padid;
  if (!padId) {
    throw Boom.notAcceptable('missing parameters');
  }
  const resource = `/pads/${padId}`;
  const data = await tables();
  const notebook = await data.pads.get({ id: padId });
  if (!notebook) {
    throw Boom.notFound('No such notebook');
  }
  if (!notebook.isPublic) {
    const [{ user }] = await expectAuthenticated(event);
    await expectAuthorized({ resource, user, permissionType: 'READ' });
  }

  const attachmentId = event.pathParameters?.attachmentid;
  if (!attachmentId) {
    return {
      statusCode: 400,
      body: 'Missing parameters',
    };
  }
  const attachment = await data.fileattachments.get({ id: attachmentId });
  if (!attachment) {
    throw Boom.notFound('No such attachment');
  }
  if (attachment.resource_uri !== resource) {
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
