import { resource } from '@decipad/backend-resources';
import Boom from '@hapi/boom';
import handle from '../handle';
import { getPostComputerCacheForm } from '@decipad/remote-computer-cache/server';

const notebooks = resource('notebook');

export const handler = handle(async (event, user) => {
  const notebookId = event.pathParameters?.padid;
  if (!notebookId) {
    throw Boom.notAcceptable('missing parameters');
  }
  if (!user) {
    throw Boom.unauthorized('User not authenticated');
  }

  // Check that the user is authorised to access this pad
  await notebooks.expectAuthorized({
    user,
    recordId: notebookId,
    minimumPermissionType: 'WRITE',
  });

  const form = await getPostComputerCacheForm(notebookId);
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(form),
  };
});
