import { notFound } from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import { exportNotebookWithAttachments } from '@decipad/services/notebooks';
import handle from '../handle';
import { tables } from '@decipad/tables';

export const handler = handle(async (event) => {
  const notebookId = getDefined(getDefined(event.pathParameters).padid);

  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound('notebook not found');
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
