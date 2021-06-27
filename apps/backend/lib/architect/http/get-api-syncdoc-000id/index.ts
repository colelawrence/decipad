import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import handle from '../../../handle';
import auth from '../../../auth';
import { isAuthorized } from '../../../authorization';
import { decode } from '../../../resource';
import { get } from '../../../s3/pads';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const { user } = await auth(event);

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
