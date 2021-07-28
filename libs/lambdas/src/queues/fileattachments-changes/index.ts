import assert from 'assert';
import {
  TableRecordChanges,
  FileAttachmentRecord,
} from '@decipad/backendtypes';
import { remove } from '@decipad/services/blobs/attachments';
import handle from '../handle';

export const handler = handle(attachmentsChangesHandler);

async function attachmentsChangesHandler(
  event: TableRecordChanges<FileAttachmentRecord>
) {
  const { table } = event;
  assert.equal(table, 'fileattachments');

  if (event.action === 'delete') {
    await remove(event.recordBeforeDelete.filename);
  }
}
