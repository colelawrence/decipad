import { APIGatewayProxyResultV2 as HttpResponse } from 'aws-lambda';
import { matchPath } from 'react-router-dom';
import { notAcceptable, notFound } from '@hapi/boom';
import handle from '../handle';
import { tables } from '@decipad/tables';
import { app } from '@decipad/backend-config';
import { expectAuthorized } from '@decipad/services/authorization';
import { getAuthenticatedUser } from '../../../../services/src/authentication/authenticate';

export const handler = handle(async (req): Promise<HttpResponse> => {
  const { url } = req.queryStringParameters ?? {};
  if (!url) {
    throw notAcceptable('need url parameter');
  }

  let urlUrl: URL;
  try {
    urlUrl = new URL(url);
  } catch (err) {
    throw notAcceptable((err as Error).message);
  }

  const match = matchPath('/n/:notebookId', urlUrl.pathname);
  if (!match) {
    throw notAcceptable('invalid URL');
  }

  const { notebookId } = match.params;
  if (!notebookId) {
    throw notAcceptable('invalid notebook id');
  }
  const notebookIdParts = notebookId.split(':');
  const actualNotebookId = notebookIdParts[1] ?? notebookIdParts[0];
  if (!actualNotebookId) {
    throw notAcceptable('invalid notebook id');
  }

  const data = await tables();
  const notebook = await data.pads.get({ id: actualNotebookId });
  if (!notebook) {
    throw notFound('notebook not found');
  }

  await expectAuthorized({
    resource: `/pads/${notebook.id}`,
    minimumPermissionType: 'READ',
    user: await getAuthenticatedUser(req),
  });

  const title = notebook.name;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'link',
      version: '1.0',
      title,
      provider_name: 'Decipad',
      provider_url: app().urlBase,
    }),
  };
});
