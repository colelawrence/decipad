import assert from 'assert';
import { Doc as YDoc } from 'yjs';
import { TableRecordChanges, DocSyncUpdateRecord } from '@decipad/backendtypes';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import handle from '../handle';

export const handler = handle(docSyncChangesHandler);

async function docSyncChangesHandler(
  event: TableRecordChanges<DocSyncUpdateRecord>
) {
  assert.strictEqual(event.table, 'docsyncupdates');

  if (event.action === 'put') {
    await handleDocSyncCreate(event.args);
  }
}

async function handleDocSyncCreate({ id }: DocSyncUpdateRecord) {
  // let's try and compact docsync entries
  const doc = new YDoc();
  const provider = new DynamodbPersistence(id, doc);
  try {
    await provider.compact();
  } catch (err) {
    console.error(err);
  }

  return { statusCode: 200 };
}
