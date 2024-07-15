/* eslint-disable import/no-import-module-exports */
import { getURL } from '@decipad/services/blobs/attachments';
import Boom from '@hapi/boom';
import { resource } from '@decipad/backend-resources';
import tables from '@decipad/tables';
import handle from '../handle';

const notebooks = resource('notebook');

export const handler = handle(async (event, user) => {
  const padId = event.pathParameters?.padid;
  if (!padId) {
    throw Boom.notAcceptable('missing parameters');
  }

  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  const attachmentId = event.pathParameters?.attachmentid;
  if (!attachmentId) {
    return {
      statusCode: 400,
      body: 'Missing parameters',
    };
  }

  const data = await tables();

  const pad = await data.pads.get({ id: padId });
  if (!pad) {
    return {
      statusCode: 400,
      body: 'Could not find notebook',
    };
  }

  const workspaceId = pad.workspace_id;
  if (!workspaceId) {
    return {
      statusCode: 400,
      body: 'Notebook does not have a workspace.',
    };
  }

  const attachment = await data.fileattachments.get({ id: attachmentId });

  if (!attachment) {
    throw Boom.notFound('No such attachment');
  }

  if (
    attachment.resource_uri !== `/pads/${padId}` &&
    attachment.resource_uri !== `/workspaces/${pad.workspace_id}`
  ) {
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
