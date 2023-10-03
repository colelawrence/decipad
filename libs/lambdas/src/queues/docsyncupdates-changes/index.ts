import assert from 'assert';
import { TableRecordChanges, DocSyncUpdateRecord } from '@decipad/backendtypes';
import { notebookMaintenance } from '@decipad/notebook-maintenance';
import handle from '../handle';

process.env.DECI_NO_DOCSYNC_UPDATE_CHANGES = 'true';

const handleDocSyncUpdatePut = async (
  event: TableRecordChanges<DocSyncUpdateRecord>
) => {
  assert.strictEqual(event.table, 'docsyncupdates');
  if (event.action === 'put') {
    await notebookMaintenance(event.args.id);
  }
};

export const handler = handle(handleDocSyncUpdatePut);
