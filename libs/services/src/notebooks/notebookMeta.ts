import tables from '@decipad/tables';
import Boom from '@hapi/boom';

export interface NotebookAttachment {
  id: string;
  fileName: string;
  userFileName: string;
  fileType: string;
  fileSize: number;
  createdAt?: string;
}

export interface NotebookMeta {
  id: string;
  title: string;
  createdAt: string;
  attachments: NotebookAttachment[];
}

export const notebookMeta = async (
  notebookId: string
): Promise<NotebookMeta> => {
  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw Boom.notFound('notebook not found');
  }
  const attachments = (
    await data.fileattachments.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': `/pads/${notebookId}`,
      },
    })
  ).Items;

  return {
    id: notebookId,
    title: notebook.name,
    createdAt: new Date(notebook.createdAt * 1000).toISOString(),
    attachments: attachments.map((att) => ({
      id: att.id,
      fileName: att.filename,
      userFileName: att.user_filename,
      fileType: att.filetype,
      fileSize: att.filesize,
      createdAt: new Date((att.createdAt ?? 0) * 1000).toISOString(),
    })),
  };
};
