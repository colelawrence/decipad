import Boom, { notFound } from '@hapi/boom';
import { expectAuthenticated } from '@decipad/services/authentication';
import { getDefined } from '@decipad/utils';
import { exportNotebookWithAttachments } from '@decipad/services/notebooks';
import { resource } from '@decipad/backend-resources';
import handle from '../handle';
import { tables } from '@decipad/tables';

const notebooks = resource('notebook');

export const handler = handle(async (event) => {
  const notebookId = getDefined(getDefined(event.pathParameters).padid);

  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound('notebook not found');
  }

  if (!notebook.isPublicWritable) {
    const [{ user }] = await expectAuthenticated(event);
    if (!user) {
      throw Boom.forbidden('Needs authentication');
    }

    await notebooks.expectAuthorized({
      recordId: notebookId,
      user,
      minimumPermissionType: 'READ',
    });
  }

  const response = await exportNotebookWithAttachments({
    notebookId,
    remoteUpdates: event.body,
  });
  return {
    statusCode: 200,
    headers: {
      'content-type': response.contentType,
    },
    body: response.content.toString('base64'),
    isBase64Encoded: true,
  };
});
