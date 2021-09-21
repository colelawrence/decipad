import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import Boom from '@hapi/boom';
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { getURL } from '@decipad/services/blobs/attachments';
import tables from '@decipad/services/tables';
import handle from '../handle';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const { user } = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('missing parameters');
  }
  const padId = event.pathParameters.padid;
  const resource = `/pads/${padId}`;
  await expectAuthorized({ resource, user, permissionType: 'READ' });

  const attachmentId = event.pathParameters.attachmentid;
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
  const url = await getURL(attachment.filename);
  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
});
