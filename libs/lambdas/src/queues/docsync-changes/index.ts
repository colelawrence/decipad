import assert from 'assert';
import { TableRecordChanges, DocSyncRecord } from '@decipad/backendtypes';
import { remove as removeContent } from '@decipad/services/blobs/pads';
import handle from '../handle';

export const handler = handle(docSyncChangesHandler);

async function docSyncChangesHandler(event: TableRecordChanges<DocSyncRecord>) {
  assert.strictEqual(event.table, 'docsync');

  if (event.action === 'delete') {
    await handleDocSyncDelete(event.recordBeforeDelete);
  } else if (event.action === 'put') {
    await handleDocSyncUpdate(event.args);
  }
}

async function handleDocSyncUpdate({ id, _version }: DocSyncRecord) {
  if (_version > 1) {
    await removeContent(id, _version - 1);
  }
}

async function handleDocSyncDelete({ id, _version }: DocSyncRecord) {
  if (_version > 0) {
    await removeContent(id, _version - 1);
  }
}
