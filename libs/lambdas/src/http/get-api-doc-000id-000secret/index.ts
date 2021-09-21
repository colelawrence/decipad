/* eslint-disable no-underscore-dangle */
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import Automerge from 'automerge';
import { authenticate } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import tables from '@decipad/services/tables';
import { get } from '@decipad/services/blobs/pads';
import { decode } from '../../common/resource';
import handle from '../handle';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const { user } = await authenticate(event);

  if (
    !event.pathParameters ||
    !event.pathParameters.id ||
    !event.pathParameters.secret
  ) {
    return {
      statusCode: 401,
      body: 'missing parameters',
    };
  }
  const id = decode(event.pathParameters.id!);
  await expectAuthorized({
    resource: id,
    user,
    secret: event.pathParameters.secret,
    permissionType: 'READ',
  });

  const data = await tables();
  const docSync = await data.docsync.get({ id });
  if (!docSync) {
    throw Boom.notFound();
  }
  const doc = await get(id, docSync._version);
  if (!doc) {
    throw Boom.notFound();
  }
  return Automerge.load(doc);
});
