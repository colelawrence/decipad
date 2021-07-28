import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import { get } from '@decipad/services/blobs/pads';
import { decode } from '../../common/resource';
import handle from '../handle';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const { user } = await authenticate(event);

  if (!event.pathParameters) {
    return {
      statusCode: 401,
      body: 'missing parameters',
    };
  }
  const id = decode(event.pathParameters.id!);
  if (!user || !(await isAuthorized(id, user, 'READ'))) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  const doc = await get(id);
  if (!doc) {
    return {
      statusCode: 403,
      body: 'Not found',
    };
  }
  return doc;
});
