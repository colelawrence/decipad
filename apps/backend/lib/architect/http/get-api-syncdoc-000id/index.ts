import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import handle from '../../../handle';
import tables from '../../../tables';
import auth from '../../../auth';
import { isAuthorized } from '../../../authorization';
import { decode } from '../../../resource';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const { user } = await auth(event);

  if (!event.pathParameters) {
    return {
      statusCode: 401,
      body: 'missing parameters'
    };
  }
  const id = decode(event.pathParameters.id!);
  if (!user || !(await isAuthorized(id, user, 'WRITE'))) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  const data = await tables();
  const doc = await data.syncdoc.get({ id });
  if (!doc) {
    return null;
  }
  return doc.latest;
});
