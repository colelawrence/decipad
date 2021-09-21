/* eslint-disable no-underscore-dangle */
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import { get as getPadContent } from '@decipad/services/blobs/pads';
import tables from '@decipad/services/tables';
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
  const uri = decode(event.pathParameters.id);
  if (!user || !(await isAuthorized(uri, user, 'READ'))) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  const data = await tables();
  const doc = await data.docsync.get({ id: uri });
  if (!doc) {
    return {
      statusCode: 403,
      body: 'Not found',
    };
  }
  return getPadContent(uri, doc._version);
});
