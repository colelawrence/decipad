/* eslint-disable import/no-import-module-exports */
import { expectAuthenticated } from '@decipad/services/authentication';
import tables from '@decipad/tables';
import { resource } from '@decipad/backend-resources';
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import handle from '../handle';

const notebooks = resource('notebook');

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const [{ user }] = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('missing parameters');
  }
  const padId = event.pathParameters.padid;
  if (!padId) {
    throw Boom.notAcceptable('missing parameter padid');
  }
  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

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
