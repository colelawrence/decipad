import Zip from 'adm-zip';
import Boom from '@hapi/boom';
import { PadRecord, User } from '@decipad/backendtypes';
import { app as getAppConfig } from '@decipad/backend-config';
import { nanoid } from 'nanoid';
import { importNotebookContent } from './importNotebookContents';
import { NotebookMeta } from './notebookMeta';
import { parseJSON } from './parseJSON';
import { importAttachment } from './importAttachment';
import { ReplaceList } from './types';

export interface ImportNotebookFromZipProps {
  workspaceId: string;
  source: Buffer;
  user: User;
  pad?: PadRecord;
}

const {
  limits: { maxAttachmentSize },
} = getAppConfig();

export const importNotebookFromZip = async (
  options: ImportNotebookFromZipProps
): Promise<PadRecord> => {
  const newNotebookId = nanoid();
  const zip = new Zip(options.source);
  const docEntry = zip.getEntry('notebook.json');
  if (!docEntry) {
    throw Boom.badRequest('zip file does not contain notebook.json entry');
  }
  const metaEntry = zip.getEntry('meta.json');
  if (!metaEntry) {
    throw Boom.badRequest('zip file does not contain meta.json entry');
  }
  const meta = parseJSON(metaEntry.getData().toString('utf-8')) as NotebookMeta;

  if (!Array.isArray(meta.attachments)) {
    throw new Error('invalid meta.attachments');
  }

  const replaceList: ReplaceList = {
    [`/pads/${meta.id}`]: `/pads/${newNotebookId}`,
  };

  for (const attachment of meta.attachments) {
    const attPath = `/attachments/${attachment.id}_${attachment.userFileName}`;
    const attEntry = zip.getEntry(attPath);
    if (!attEntry) {
      throw Boom.badRequest(
        `archive does not contain attachment file at ${attPath}`
      );
    }
    // higher max size limit on import because sometimes images can get bigger because of resize
    const higherLimit = maxAttachmentSize * 1.5;
    const attData = attEntry.getData();
    if (attData.length > higherLimit) {
      throw Boom.forbidden(
        `attachment file size at ${attPath} has ${attData.length} bytes, which exceeds maximum size of ${higherLimit} bytes`
      );
    }
    // eslint-disable-next-line no-await-in-loop
    const newAttachment = await importAttachment({
      meta: attachment,
      content: attData,
      targetNotebookId: newNotebookId,
      user: options.user,
    });

    replaceList[
      `/attachments/${attachment.id}`
    ] = `/attachments/${newAttachment.id}`;
  }

  const doc = docEntry.getData().toString('utf-8');
  const pad = await importNotebookContent({
    ...options,
    pad: undefined,
    padId: newNotebookId,
    source: doc,
    replaceList,
  });

  return pad;
};

export interface ImportNotebookProps {
  workspaceId: string;
  source: string;
  user: User;
  pad?: PadRecord;
}

export const importNotebook = async (
  options: ImportNotebookProps & { source: string }
): Promise<PadRecord> => {
  try {
    return await importNotebookFromZip({
      ...options,
      source: Buffer.from(options.source, 'base64'),
    });
  } catch (err) {
    if ((err as Error).message.toLocaleLowerCase().includes('zip')) {
      return importNotebookContent({
        ...options,
        source: Buffer.from(options.source, 'base64').toString('utf-8'),
      });
    }
    throw err;
  }
};
