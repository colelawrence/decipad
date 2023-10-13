/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import stringify from 'json-stringify-safe';
import { Document } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
import Zip from 'adm-zip';
import { captureException } from '@decipad/backend-trace';
import { exportNotebookContent } from './exportNotebookContent';
import { notebookMeta } from './notebookMeta';
import { getAttachmentContent } from '../blobs/attachments';

interface ExportNotebookWithAttachmentsResult {
  title: string;
  content: Buffer;
  contentType: string;
}

interface ExportNotebookWithAttachmentsProps {
  notebookId: string;
  remoteUpdates?: string;
  doc?: Document;
}

const serialize = (_: string, value: unknown): unknown =>
  typeof value === 'bigint' ? value.toString() : value;

const getNotebookTitle = (document: Document): string =>
  getNodeString(document?.children[0] ?? { text: '' }) || 'notebook';

export const exportNotebookWithAttachments = async ({
  notebookId,
  remoteUpdates,
  doc: _doc,
}: ExportNotebookWithAttachmentsProps): Promise<ExportNotebookWithAttachmentsResult> => {
  const zip = new Zip();
  const doc = _doc || (await exportNotebookContent(notebookId, remoteUpdates));
  zip.addFile(
    'notebook.json',
    Buffer.from(stringify(doc, serialize, '\t'), 'utf-8')
  );
  const meta = await notebookMeta(notebookId);
  zip.addFile('meta.json', Buffer.from(stringify(meta, null, '\t'), 'utf-8'));

  for (const attachment of meta.attachments) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const attachmentContent = await getAttachmentContent(attachment.fileName);
      zip.addFile(
        `/attachments/${attachment.id}_${attachment.userFileName}`,
        attachmentContent
      );
    } catch (err) {
      console.error('Error fetching attachment', attachment);
      console.error('Error caught fetching attachment', err);
      await captureException(err as Error);
    }
  }

  return {
    title: getNotebookTitle(doc),
    content: zip.toBuffer(),
    contentType: 'application/zip',
  };
};
