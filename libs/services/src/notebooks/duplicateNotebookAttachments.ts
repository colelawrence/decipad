import { FileAttachmentRecord } from '@decipad/backendtypes';
import { app } from '@decipad/config';
import tables from '@decipad/tables';
import { nanoid } from 'nanoid';
import {
  duplicate as duplicateFile,
  attachmentFilePath,
} from '../blobs/attachments';
import { ReplaceList } from './types';

const isAttachmentAbsolute = (attachment: FileAttachmentRecord): boolean =>
  attachment.filename.startsWith('http://') ||
  attachment.filename.startsWith('https://');

const isAttachmentLocal = (attachment: FileAttachmentRecord): boolean => {
  return (
    !isAttachmentAbsolute(attachment) ||
    attachment.filename.startsWith(app().urlBase)
  );
};

const duplicateAttachment = async (
  sourceNotebookId: string,
  targetNotebookId: string,
  attachment: FileAttachmentRecord
): Promise<FileAttachmentRecord> => {
  const data = await tables();
  const newId = nanoid();
  const newAttachment: FileAttachmentRecord = {
    ...attachment,
    id: newId,
    resource_uri: `/pads/${targetNotebookId}`,
  };
  if (isAttachmentLocal(attachment)) {
    const oldFileName = attachmentFilePath(
      sourceNotebookId,
      attachment.user_filename,
      attachment.id
    );
    const newFileName = attachmentFilePath(
      targetNotebookId,
      attachment.user_filename,
      newId
    );
    await duplicateFile(oldFileName, newFileName);
  }

  await data.fileattachments.create(newAttachment);
  return newAttachment;
};

export const duplicateNotebookAttachments = async (
  sourceNotebookId: string,
  targetNotebookId: string
): Promise<ReplaceList> => {
  const data = await tables();

  const sourceNoteBookResource = `/pads/${sourceNotebookId}`;

  const attachments = (
    await data.fileattachments.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': sourceNoteBookResource,
      },
    })
  ).Items;

  const replacements: ReplaceList = {
    [sourceNoteBookResource]: `/pads/${targetNotebookId}`,
  };
  for (const attachment of attachments) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const newAttachment = await duplicateAttachment(
        sourceNotebookId,
        targetNotebookId,
        attachment
      );
      replacements[
        `/attachments/${attachment.id}`
      ] = `/attachments/${newAttachment.id}`;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error duplicating attachment', attachment);
    }
  }

  return replacements;
};
