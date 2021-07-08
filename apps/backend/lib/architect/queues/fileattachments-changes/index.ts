import assert from 'assert';
import handle from '../../../queues/handler';
import { remove } from '../../../s3/attachments';

export const handler = handle(attachmentsChangesHandler);

async function attachmentsChangesHandler(
  event: TableRecordChanges<FileAttachmentRecord>
) {
  const { table, action, recordBeforeDelete } = event;

  assert.equal(table, 'fileattachments');
  if (action !== 'delete') {
    return;
  }

  if (!recordBeforeDelete) {
    return;
  }

  await remove(recordBeforeDelete.filename);
}
