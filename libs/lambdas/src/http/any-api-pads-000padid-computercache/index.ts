import { resource } from '@decipad/backend-resources';
import Boom from '@hapi/boom';
import handle from '../handle';
import {
  getComputerCacheUrl,
  getPostComputerCacheForm,
} from '@decipad/remote-computer-cache/server';
import { type Handler } from '@decipad/backendtypes';

const notebooks = resource('notebook');

export const getHandler: Handler = async (event, user) => {
  const notebookId = event.pathParameters?.padid;
  if (!notebookId) {
    throw Boom.notAcceptable('missing parameters');
  }

  // Check that the user is authorised to access this pad
  await notebooks.expectAuthorized({
    user,
    recordId: notebookId,
    minimumPermissionType: 'READ',
  });

  const url = await getComputerCacheUrl(notebookId);
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ url }),
  };
};

const postHandler: Handler = async (event, user) => {
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
};

export const handler = handle(async (event, user) => {
  const { method } = event.requestContext.http;
  if (method === 'GET') {
    return getHandler(event, user);
  }
  if (method === 'POST') {
    return postHandler(event, user);
  }
  throw new Error(`Unsupported method ${event.requestContext.http.method}`);
});
