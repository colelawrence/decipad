import assert from 'assert';
import {
  AllowListRecord,
  TableRecordChanges,
  SuperAdminActionLogRecord,
} from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import tables from '@decipad/tables';
import handle from '../handle';
import timestamp from '../../common/timestamp';

export const handler = handle(allowListChangesHandler);

const EVENT_EXPIRATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

async function allowListChangesHandler(
  event: TableRecordChanges<AllowListRecord>
) {
  assert.strictEqual(event.table, 'allowlist');

  if (!event.user_id) {
    return;
  }

  const superadminEvent: SuperAdminActionLogRecord = {
    id: nanoid(),
    user_id: event.user_id,
    subject: 'allowlist',
    action: event.action,
    args: JSON.stringify(event.args),
    expiresAt: timestamp() + EVENT_EXPIRATION_SECONDS,
  };

  const data = await tables();
  await data.superadminactionlogs.put(superadminEvent);
}
