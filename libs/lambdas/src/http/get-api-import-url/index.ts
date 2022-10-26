import { expectAuthenticated } from '@decipad/services/authentication';
import { getDefined } from '@decipad/utils';
import { User } from '@decipad/backendtypes';
import { APIGatewayProxyResultV2 as HttpResponse } from 'aws-lambda';
import Boom from '@hapi/boom';
import { app } from '@decipad/config';
import { expectAuthorized } from '@decipad/services/authorization';
import { create as createNotebook } from '@decipad/services/notebooks';
import { ensurePrivateWorkspaceForUser } from '@decipad/services/workspaces';
import handle from '../handle';

async function checkAccess(
  user: User | undefined,
  padId: string
): Promise<void> {
  if (!user) {
    throw Boom.forbidden('Needs authentication');
  }

  const resource = `/pads/${padId}`;
  await expectAuthorized({ resource, user, permissionType: 'WRITE' });
}

export const handler = handle(async (event): Promise<HttpResponse> => {
  const [{ user }] = await expectAuthenticated(event);
  let padId = getDefined(event.queryStringParameters).padid;
  if (!padId) {
    const workspace = await ensurePrivateWorkspaceForUser(user);
    const newNotebook = await createNotebook(
      workspace.id,
      { name: 'import' },
      user
    );
    padId = newNotebook.id;
  }
  const url = getDefined(
    getDefined(event.queryStringParameters).url,
    'need a url parameter'
  );
  await checkAccess(user, padId);

  const importUrl = `${app().urlBase}/n/${encodeURIComponent(
    padId
  )}?import=${encodeURIComponent(url)}`;

  const response = {
    url: importUrl,
    user,
  };
  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers: {
      'Access-Control-Allow-Methods': 'HEAD, GET',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'True',
    },
  };
});
