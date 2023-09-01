import { timestamp } from '@decipad/backend-utils';
import { MAX_CREDITS_EXEC_COUNT } from '@decipad/backendtypes';
import tables, { allScanPages } from '@decipad/tables';
import handle from '../../http/handle';

async function resetQueryCount() {
  const data = await tables();

  for await (const execQuery of allScanPages(data.workspacexecutedqueries)) {
    if (execQuery?.quotaLimit === MAX_CREDITS_EXEC_COUNT.free) {
      await data.workspacexecutedqueries.put({
        ...execQuery,
        queryCount: 0,
        query_reset_date: timestamp(),
      });
    }
  }
}

const resetQueryCountHandler = async () => {
  await resetQueryCount();
};

export const handler = handle(resetQueryCountHandler);
