import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import { getURL } from '@decipad/services/blobs/attachments';
import tables from '@decipad/services/tables';
import handle from '../handle';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const { user } = await authenticate(event);

  if (!user) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  if (!event.pathParameters) {
    return {
      statusCode: 401,
      body: 'missing parameters',
    };
  }
  const padId = event.pathParameters.padid;
  const resource = `/pads/${padId}`;
  if (!(await isAuthorized(resource, user, 'READ'))) {
    return {
      statusCode: 403,
      body: 'Forbidden',
    };
  }

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
    return {
      statusCode: 404,
      body: 'No such attachment',
    };
  }
  const url = await getURL(attachment.filename);
  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
});
