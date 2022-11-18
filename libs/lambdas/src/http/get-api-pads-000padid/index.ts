/* eslint-disable import/no-import-module-exports */
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import handle from '../handle';

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const [{ user }] = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('missing parameters');
  }
  const padId = event.pathParameters.padid;
  if (!padId) {
    throw Boom.notAcceptable('missing parameter padid');
  }
  const resource = `/pads/${padId}`;
  await expectAuthorized({ resource, user, permissionType: 'READ' });

  const data = await tables();
  const notebook = await data.pads.get({ id: padId });
  if (!notebook) {
    throw Boom.notFound('No such notebook');
  }

  return {
    statusCode: 200,
    body: JSON.stringify(notebook),
    headers: { ContentType: 'application/json' },
  };
});
