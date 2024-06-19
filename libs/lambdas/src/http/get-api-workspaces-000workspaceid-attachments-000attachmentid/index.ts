/* eslint-disable import/no-import-module-exports */
import { getURL } from '@decipad/services/blobs/attachments';
import Boom from '@hapi/boom';
import { resource } from '@decipad/backend-resources';
import tables from '@decipad/tables';
import handle from '../handle';

const workspaces = resource('workspace');

//
// This whole file is copied from the lambda that handles pad level
// attachments
//
// pads padid attahcments attachmentId
//
// So a lot of repeated code. Should extract this into @services.
//

export const handler = handle(async (event, user) => {
  const workspaceId = event.pathParameters?.workspaceid;
  if (workspaceId == null) {
    throw Boom.notAcceptable('missing parameters');
  }

  await workspaces.expectAuthorized({
    user,
    recordId: workspaceId,
    minimumPermissionType: 'READ',
  });

  const attachmentId = event.pathParameters?.attachmentid;
  if (attachmentId == null) {
    throw Boom.badRequest('missing parameters');
  }

  const data = await tables();

  const workspace = await data.workspaces.get({ id: workspaceId });
  if (workspace == null) {
    throw Boom.badRequest('could not find this workspace');
  }

  const attachment = await data.fileattachments.get({ id: attachmentId });

  if (attachment == null) {
    throw Boom.notFound('No such attachment');
  }
  if (attachment.resource_uri !== `/workspaces/${workspaceId}`) {
    throw Boom.forbidden('Forbidden');
  }

  const url = await getURL(attachment.filename);
  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
});
