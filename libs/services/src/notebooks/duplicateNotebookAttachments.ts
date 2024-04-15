import type { FileAttachmentRecord } from '@decipad/backendtypes';
import { app } from '@decipad/backend-config';
import tables, { allPages } from '@decipad/tables';
import { nanoid } from 'nanoid';
import {
  duplicate as duplicateFile,
  attachmentFilePath,
} from '../blobs/attachments';
import type { ReplaceList } from './types';

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
    const oldFileName = attachment.filename;
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

const MEGABYTE = 1_000_000;
export const getPadAttachmentSize = async (padId: string): Promise<number> => {
  const data = await tables();

  const attachments = allPages(data.fileattachments, {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    ExpressionAttributeValues: {
      ':resource_uri': `/pads/${padId}`,
    },
  });

  let usage = 0;

  for await (const attachment of attachments) {
    if (attachment == null) {
      continue;
    }

    usage += attachment.filesize;
  }

  return usage / MEGABYTE;
};

export const duplicateNotebookAttachments = async (
  sourceNotebookId: string,
  targetNotebookId: string
): Promise<[ReplaceList, number]> => {
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

  let storageUsed = 0;

  const replacements: ReplaceList = {
    [sourceNoteBookResource]: `/pads/${targetNotebookId}`,
  };
  for (const attachment of attachments) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const newAttachment = await duplicateAttachment(
        targetNotebookId,
        attachment
      );

      storageUsed += attachment.filesize;

      replacements[
        `/attachments/${attachment.id}`
      ] = `/attachments/${newAttachment.id}`;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error duplicating attachment', attachment, err);
    }
  }

  return [replacements, storageUsed];
};
