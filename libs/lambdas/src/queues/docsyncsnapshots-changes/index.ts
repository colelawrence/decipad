import assert from 'assert';
import {
  TableRecordChanges,
  DocSyncSnapshotRecord,
} from '@decipad/backendtypes';
import { notebookMaintenance } from '@decipad/notebook-maintenance';
import handle from '../handle';

process.env.DECI_NO_DOCSYNC_UPDATE_CHANGES = 'true';

const handleDocSyncUpdatePut = async (
  event: TableRecordChanges<DocSyncSnapshotRecord>
) => {
  assert.strictEqual(event.table, 'docsyncsnapshots');
  if (event.action === 'put') {
    await notebookMaintenance(event.args.docsync_id);
  }
};

export const handler = handle(handleDocSyncUpdatePut);
