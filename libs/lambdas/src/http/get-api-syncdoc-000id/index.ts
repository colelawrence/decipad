/* eslint-disable no-underscore-dangle */
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import Boom from '@hapi/boom';
import { authenticate } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { get as getPadContent } from '@decipad/services/blobs/pads';
import tables from '@decipad/services/tables';
import { decode } from '../../common/resource';
import handle from '../handle';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const secret = event.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const { user } = await authenticate(event);

  if (!event.pathParameters) {
    throw Boom.notAcceptable('missing parameters');
  }
  const id = decode(event.pathParameters.id!);
  await expectAuthorized({
    resource: id,
    user,
    secret,
    permissionType: 'READ',
  });

  const data = await tables();
  const doc = await data.docsync.get({ id });
  if (!doc) {
    throw Boom.notFound('Not found');
  }
  return getPadContent(id, doc._version);
});
