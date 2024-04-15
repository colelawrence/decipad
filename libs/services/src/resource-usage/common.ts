import type {
  AiResourceUsageKeyWithoutID,
  ResourceUsageKeys,
  ResourceUsageRecord,
  StorageResourceUsageKeyWithoutID,
} from '@decipad/backendtypes';
import tables, { incrementTableField, timestamp } from '@decipad/tables';

type ResourceKeyWithoutID =
  | AiResourceUsageKeyWithoutID
  | StorageResourceUsageKeyWithoutID;

export const CONSUMPTION = 'consumption';
export const ORIGINAL_AMOUNT = 'originalAmount';

/**
 * Gives you amazing autocomplete, and adds the consumerID
 * onto the end of the key to make it valid.
 */
export function getKey(
  key: ResourceKeyWithoutID,
  consumerId: string
): ResourceUsageKeys {
  return `${key}/${consumerId}`;
}

export function getResourceUri(workspaceId: string): `/workspace/${string}` {
  return `/workspace/${workspaceId}`;
}

/**
 * Get the raw database record.
 *
 * I'd avoid using this generally, but sometimes you can't really avoid it.
 */
export async function getUsageRecord(
  key: ResourceKeyWithoutID,
  consumerId: string
): Promise<ResourceUsageRecord | undefined> {
  const data = await tables();
  const keyWithId = getKey(key, consumerId);
  return data.resourceusages.get({ id: keyWithId });
}

/**
 * Helper function, mostly to insert `undefined` type into
 * return value to force checks.
 */
export async function getResourceUsageRecords(
  ...keys: Array<ResourceUsageKeys>
): Promise<Array<ResourceUsageRecord | undefined>> {
  const data = await tables();
  return data.resourceusages.batchGet(keys);
}

export async function upsertResourceUsage(
  key: ResourceUsageKeys,
  consumption: number,
  originalAmount?: number
): Promise<void> {
  const data = await tables();
  const usage = await data.resourceusages.get({ id: key });

  if (usage == null) {
    await data.resourceusages.put({
      id: key,
      createdAt: timestamp(),
      consumption,
      originalAmount,
    });
    return;
  }

  await incrementTableField(data.resourceusages, key, CONSUMPTION, consumption);
}

export async function resetQueryCount(workspaceId: string): Promise<void> {
  const data = await tables();

  const queryExecutionRecord = await data.workspacexecutedqueries.get({
    id: workspaceId,
  });

  if (queryExecutionRecord) {
    await data.workspacexecutedqueries.put({
      ...queryExecutionRecord,
      query_reset_date: timestamp(),
      queryCount: 0,
    });
  }
}
