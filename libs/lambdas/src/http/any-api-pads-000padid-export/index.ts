import Boom from '@hapi/boom';
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { getDefined } from '@decipad/utils';
import { exportNotebookWithAttachments } from '@decipad/services/notebooks';
import handle from '../handle';

export const handler = handle(async (event) => {
  const notebookId = getDefined(getDefined(event.pathParameters).padid);

  const [{ user }] = await expectAuthenticated(event);
  if (!user) {
    throw Boom.forbidden('Needs authentication');
  }

  const resource = `/pads/${notebookId}`;
  await expectAuthorized({ resource, user, permissionType: 'READ' });

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
