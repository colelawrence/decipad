import { FileAttachmentRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { nanoid } from 'nanoid';
import { attachmentFilePath } from '../blobs/attachments';
import { resize } from './resize';
import { save } from '../blobs/save';
import { Upload } from './types';

export const createImageAttachment = async (
  userId: string,
  padId: string,
  upload: Upload
): Promise<FileAttachmentRecord> => {
  const buffer = await resize(Buffer.from(upload.body, 'base64'));
  const attachmentId = nanoid();
  const fileName = 'image.png';
  const filePath = attachmentFilePath(padId, fileName, attachmentId);
  const fileType = 'image/png';
  await save(filePath, buffer, fileType);

  const data = await tables();
  const fileAttachmentRecord = {
    id: attachmentId,
    filename: filePath,
    filesize: buffer.byteLength,
    user_filename: fileName,
    filetype: fileType,
    resource_uri: `/pads/${padId}`,
    user_id: userId,
  };
  await data.fileattachments.create(fileAttachmentRecord);
  return fileAttachmentRecord;
};
