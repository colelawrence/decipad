import { FileAttachmentRecord, User } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { nanoid } from 'nanoid';
import { NotebookAttachment } from './notebookMeta';
import { attachmentFilePath } from '../blobs/attachments';
import { save } from '../blobs/save';

interface ImportAttachmentOptions {
  meta: NotebookAttachment;
  content: Buffer;
  targetNotebookId: string;
  user: User;
}

export const importAttachment = async ({
  meta,
  content,
  targetNotebookId,
  user,
}: ImportAttachmentOptions): Promise<FileAttachmentRecord> => {
  const id = nanoid();
  const filename = attachmentFilePath(targetNotebookId, meta.fileName, id);
  await save(filename, content, meta.fileType);
  const data = await tables();
  const att: FileAttachmentRecord = {
    id,
    resource_uri: `/pads/${targetNotebookId}`,
    filesize: meta.fileSize,
    user_filename: meta.fileName,
    filetype: meta.fileType,
    user_id: user.id,
    filename,
  };
  await data.fileattachments.create(att);
  return att;
};
