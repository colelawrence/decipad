/* eslint-disable import/no-import-module-exports */
import { expectAuthenticated } from '@decipad/services/authentication';
import { attachmentUrl } from '@decipad/services/blobs/attachments';
import { createImageAttachment } from '@decipad/services/images';
import { resourceusage } from '@decipad/services';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';
import tables from '@decipad/tables';

const notebooks = resource('notebook');
const MEGABYTE = 1_000_000;

exports.handler = handle(async (event: APIGatewayProxyEvent) => {
  const [{ user }] = await expectAuthenticated(event);
  if (!event.pathParameters) {
    throw Boom.notAcceptable('missing parameters');
  }
  const padId = getDefined(event.pathParameters.padid);
  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  if (!event.body) {
    throw Boom.badRequest('no image uploaded');
  }

  const data = await tables();
  const notebook = await data.pads.get({ id: padId });
  const workspaceId = notebook?.workspace_id;

  if (workspaceId == null) {
    throw new Error('WorkspaceID doesnt exist on this notebook, cannot attach');
  }

  const hasReachedLimit = await resourceusage.hasReachedLimit(
    'storage',
    workspaceId
  );

  if (hasReachedLimit) {
    throw Boom.tooManyRequests("You've exceeded your storage quota");
  }

  const attachment = await createImageAttachment(user.id, padId, {
    headers: event.headers,
    body: event.body,
  });

  await resourceusage.upsertStorage(
    workspaceId,
    'images',
    attachment.filesize / MEGABYTE
  );

  return {
    statusCode: 200,
    body: attachmentUrl(padId, attachment.id),
    headers: {
      'content-type': 'text/plain',
    },
  };
});
