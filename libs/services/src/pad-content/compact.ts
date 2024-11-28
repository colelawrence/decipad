/* eslint-disable no-restricted-properties */
import { mergeUpdates } from 'yjs';
import pick from 'lodash.pick';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import { createUpdate } from './createUpdate';
import { getAllUpdateRecords } from './updates';
import { MAX_RECORD_SIZE_BYTES } from './constants';

export const compact = async (padId: string) => {
  const data = await tables();
  const updates = await getAllUpdateRecords(padId);
  let merged: Uint8Array | undefined;
  let toDelete: Array<{ id: string; seq: string }> = [];

  const mergedSize = () => merged?.length ?? 0;

  const pushToDataBase = async () => {
    if (toDelete.length > 1) {
      await createUpdate(padId, getDefined(merged), true);
      data.docsyncupdates.batchDelete(toDelete);
    }
    merged = undefined;
    toDelete = [];
  };

  for await (const update of updates) {
    const updateId = pick(update, ['id', 'seq']);
    if (mergedSize() + update.data.length < MAX_RECORD_SIZE_BYTES) {
      merged = merged ? mergeUpdates([merged, update.data]) : update.data;
      toDelete.push(updateId);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await pushToDataBase();
      merged = update.data;
      toDelete.push(updateId);
    }
  }
  await pushToDataBase();
};
