import { timestamp } from '@decipad/backend-utils';
import tables, { allScanPages } from '@decipad/tables';
import assert from 'assert';
import { ScheduledEvent } from 'aws-lambda';
import handle from '../handle';
import { limits } from '@decipad/backend-config';

async function resetQueryCount() {
  const data = await tables();

  for await (const execQuery of allScanPages(data.workspacexecutedqueries)) {
    if (execQuery?.quotaLimit === limits().maxCredits.free) {
      await data.workspacexecutedqueries.put({
        ...execQuery,
        queryCount: 0,
        query_reset_date: timestamp(),
      });
    }
  }
}

const resetQueryCountHandler = async (event: ScheduledEvent) => {
  assert.strictEqual(event['detail-type'], 'Scheduled Event');
  await resetQueryCount();
};

export const handler = handle(resetQueryCountHandler);
