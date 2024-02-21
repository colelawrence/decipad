import { limits } from '@decipad/backend-config';
import {
  AiFields,
  AiResourceUsageKeyWithoutID,
  ResourceConsumer,
  ResourceUsageHistoryRecord,
  ResourceUsageKeys,
  ResourceUsageRecord,
  StorageResourceUsageKeyWithoutID,
  StorageSubtypes,
} from '@decipad/backendtypes';
import { ResourceTypes } from '@decipad/graphqlserver-types';
import tables, { incrementTableField, timestamp } from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import { paymentRequired } from '@hapi/boom';
import { nanoid } from 'nanoid';
import type { CompletionUsage } from 'openai/resources';
import * as subscriptions from '../subscriptions';

const CONSUMPTION = 'consumption';
const ORIGINAL_AMOUNT = 'originalAmount';

type ResourceKeyWithoutID =
  | AiResourceUsageKeyWithoutID
  | StorageResourceUsageKeyWithoutID;

// ============================================================
// Private methods.
//
// Use within this file.
// ============================================================

/**
 * Gives you amazing autocomplete, and adds the consumerID
 * onto the end of the key to make it valid.
 */
function getKey(
  key: ResourceKeyWithoutID,
  consumerId: string
): ResourceUsageKeys {
  return `${key}/${consumerId}`;
}

function getResourceUri(workspaceId: string): `/workspace/${string}` {
  return `/workspace/${workspaceId}`;
}

/**
 * Helper function, mostly to insert `undefined` type into
 * return value to force checks.
 */
async function getResourceUsageRecords(
  ...keys: Array<ResourceUsageKeys>
): Promise<Array<ResourceUsageRecord | undefined>> {
  const data = await tables();
  return data.resourceusages.batchGet(keys);
}

async function upsertResourceUsage(
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

async function getExtraAiRecord(
  workspaceId: string
): Promise<ResourceUsageRecord | undefined> {
  return getUsageRecord('openai/extra-credits/null/workspaces', workspaceId);
}

/**
 * @note returns credits NOT TOKENs
 */
async function getAiUsageWithoutExtraCredits(
  workspaceId: string
): Promise<number> {
  const promptTokensKey = getKey(
    'openai/gpt-4-1106-preview/promptTokensUsed/workspaces',
    workspaceId
  );

  const completionTokensKey = getKey(
    'openai/gpt-4-1106-preview/completionTokensUsed/workspaces',
    workspaceId
  );

  const [promptTokens, completionTokens] = await getResourceUsageRecords(
    promptTokensKey,
    completionTokensKey
  );

  let storageUsed = 0;

  if (promptTokens != null) {
    storageUsed += promptTokens.consumption;
  }

  if (completionTokens != null) {
    storageUsed += completionTokens.consumption;
  }

  const [subscription, isPremium] = await Promise.all([
    subscriptions.getWsSubscription(workspaceId),
    subscriptions.isPremiumWorkspace(workspaceId),
  ]);

  if (subscription == null) {
    const plan = isPremium ? 'pro' : 'free';
    return (
      Math.min(storageUsed, limits().openAiTokensLimit[plan]) /
      limits().tokensToCredits
    );
  }

  return Math.min(
    getDefined(subscription.credits),
    storageUsed / limits().tokensToCredits
  );
}

// ============================================================
// Public methods.
//
// To be used by other parts of the code.
// ============================================================

/**
 * Returns the storage used by a workspace in megabytes.
 */
export async function getStorageUsage(workspaceId: string): Promise<number> {
  const filesKey = getKey('storage/files/null/workspaces', workspaceId);
  const imageKey = getKey('storage/images/null/workspaces', workspaceId);

  const [filesStorage, imagesStorage] = await getResourceUsageRecords(
    filesKey,
    imageKey
  );

  let storageUsed = 0;

  if (filesStorage != null) {
    storageUsed += filesStorage.consumption;
  }

  if (imagesStorage != null) {
    storageUsed += imagesStorage.consumption;
  }

  return storageUsed;
}

/**
 * Updates/Inserts consumption value for storage usage.
 *
 * @note in megabytes
 */
export async function upsertStorage(
  workspaceId: string,
  subtype: StorageSubtypes,
  consumption: number
): Promise<void> {
  const storageKey = getKey(`storage/${subtype}/null/workspaces`, workspaceId);

  await upsertResourceUsage(storageKey, consumption);
}

/**
 * Returns the amount of credits (NOT tokens), used by a workspace.
 */
export async function getAiUsage(workspaceId: string): Promise<number> {
  const [extraAi, aiUsage] = await Promise.all([
    getExtraAiRecord(workspaceId),
    getAiUsageWithoutExtraCredits(workspaceId),
  ]);

  const extraAiConsumption = extraAi?.consumption ?? 0;

  return extraAiConsumption + aiUsage;
}

/**
 * Updates/Inserts consumption value for ai usage.
 * It also takes care of updating `extra-credits` records.
 *
 * @throws if you call it and there is not enough credits.
 * make sure to check if you have enough using `getLimits`
 *
 * @note consumption should be in tokens, not credits.
 */
export async function upsertAi(
  workspaceId: string,
  field: AiFields,
  consumption: number
): Promise<void> {
  const aiKey = getKey(
    `openai/gpt-4-1106-preview/${field}/workspaces`,
    workspaceId
  );

  const [wsLimits, usage] = await Promise.all([
    getLimit(workspaceId),
    getAiUsageWithoutExtraCredits(workspaceId),
  ]);

  if (usage < wsLimits.openai - wsLimits.openaiExtraCredits) {
    await upsertResourceUsage(aiKey, consumption);
    return;
  }

  //
  // We have reached our subscription limit. Let's check if we have
  // any extra credits or reached a limit.
  //

  const extraAi = await getExtraAiRecord(workspaceId);

  if (extraAi == null) {
    throw paymentRequired(
      `No extra credits present and subscription exceeded.`
    );
  }

  const data = await tables();

  await incrementTableField(
    data.resourceusages,
    getKey('openai/extra-credits/null/workspaces', workspaceId),
    CONSUMPTION,
    consumption / limits().tokensToCredits
  );
}

/**
 * Creates a new record with `extra-credits` to be used by the user
 */
export async function insertExtraAi(
  workspaceId: string,
  credits: number
): Promise<void> {
  if (credits <= 0) {
    throw new Error('You cannot create extra credits with 0 or less');
  }

  const extraCreditsKey = getKey(
    'openai/extra-credits/null/workspaces',
    workspaceId
  );

  const exists = await getExtraAiRecord(workspaceId);

  if (!exists) {
    return upsertResourceUsage(extraCreditsKey, 0, credits);
  }

  const data = await tables();

  return incrementTableField(
    data.resourceusages,
    extraCreditsKey,
    ORIGINAL_AMOUNT,
    credits
  );
}

/**
 * Adds up all workspace's extra credits and returns a number
 *
 * If no extra credits were purchased, 0 is returned.
 */
export async function getRemainingExtraCredits(
  workspaceId: string
): Promise<number> {
  const extraAiRecord = await getUsageRecord(
    'openai/extra-credits/null/workspaces',
    workspaceId
  );

  if (extraAiRecord == null) {
    return 0;
  }

  return Math.max(
    0,
    getDefined(extraAiRecord?.originalAmount) - extraAiRecord.consumption
  );
}

/**
 * Convenience function to return all resource usages for a workspace.
 */
export async function getUsage(
  workspaceId: string
): Promise<Record<ResourceTypes, number>> {
  const [openai, storage] = await Promise.all([
    getAiUsage(workspaceId),
    getStorageUsage(workspaceId),
  ]);

  return {
    openai,
    storage,
  };
}

/**
 * Gives you all the resource usages a workspace has.
 *
 * `openai` is our AI usage (In credits. @see limits().tokensToCredits)
 * `storage` for file/image storage (In megabytes)
 */
export async function getLimit(
  workspaceId: string
): Promise<Record<ResourceTypes | 'openaiExtraCredits', number>> {
  const [subscription, isPremium] = await Promise.all([
    subscriptions.getWsSubscription(workspaceId),
    subscriptions.isPremiumWorkspace(workspaceId),
  ]);

  const extraAiCredits = await getRemainingExtraCredits(workspaceId);

  if (subscription == null) {
    const plan = isPremium ? 'pro' : 'free';
    return {
      openai:
        limits().openAiTokensLimit[plan] / limits().tokensToCredits +
        extraAiCredits,
      openaiExtraCredits: extraAiCredits,
      storage: limits().storage[plan],
    };
  }

  return {
    openai: getDefined(subscription.credits) + extraAiCredits,
    openaiExtraCredits: extraAiCredits,
    storage: getDefined(subscription.storage),
  };
}

/**
 * Given a resource, return if the workspace has exceeded its limit.
 */
export async function hasReachedLimit(
  resource: ResourceTypes,
  workspaceId: string
): Promise<boolean> {
  const [workspaceUsage, workspaceLimit] = await Promise.all([
    getUsage(workspaceId),
    getLimit(workspaceId),
  ]);

  return workspaceUsage[resource] >= workspaceLimit[resource];
}

// ============================================================
// Specialized methods
//
// To avoid cluttering the functions above.
// ============================================================

interface UpdateWorkspaceAndUserAiParams {
  workspaceId: string;
  userId?: string;
  usage?: CompletionUsage;
}

export async function updateWorkspaceAndUserAi({
  workspaceId,
  userId,
  usage,
}: UpdateWorkspaceAndUserAiParams): Promise<void> {
  const updates: Array<Promise<unknown>> = [];

  if (usage == null) {
    return;
  }

  updates.push(
    upsertAi(workspaceId, 'promptTokensUsed', usage.prompt_tokens),
    upsertAi(workspaceId, 'completionTokensUsed', usage.completion_tokens)
  );

  if (userId != null) {
    const promptUserKey = getKey(
      'openai/gpt-4-1106-preview/promptTokensUsed/users',
      userId
    );
    const completionUserKey = getKey(
      'openai/gpt-4-1106-preview/completionTokensUsed/users',
      userId
    );

    updates.push(
      upsertResourceUsage(promptUserKey, usage.prompt_tokens),
      upsertResourceUsage(completionUserKey, usage.completion_tokens)
    );
  }

  await Promise.all(updates);
}

/**
 * @returns the AI usage as a tuple: [PromptTokensUsed, CompletionTokensUsed]
 */
export async function getAiTokens(
  consumer: ResourceConsumer,
  consumerId: string
): Promise<[number, number]> {
  const promptKey = getKey(
    `openai/gpt-4-1106-preview/promptTokensUsed/${consumer}`,
    consumerId
  );
  const completionKey = getKey(
    `openai/gpt-4-1106-preview/completionTokensUsed/${consumer}`,
    consumerId
  );

  // Using `then`, so we dont have to await here, and then await where `getAiTokens` is called
  // Smol improvement, but still.
  return getResourceUsageRecords(promptKey, completionKey).then((values) =>
    values.map((v) => v?.consumption ?? 0)
  ) as Promise<[number, number]>;
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
 * Retrieves a workspace's previous usage records.
 *
 * @returns Map<Timestamp of last usage -> Usage Record>
 */
export async function getPreviousAiUsageRecord(
  workspaceId: string
): Promise<Array<ResourceUsageHistoryRecord>> {
  const data = await tables();

  return (
    await data.resourceusagehistory.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': getResourceUri(workspaceId),
      },
    })
  ).Items;
}

// ============================================================
// Resetting methods
//
// Be very careful when using these.
// ============================================================

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

/**
 * Resets AI usage for a workspace.
 *
 * It does this by taking the resource usage down to 0. (Subtracting current usage).
 * And then adding a record to `resourceusagehistory`, which is a read only table.
 */
export async function resetAiUsage(workspaceId: string): Promise<void> {
  const data = await tables();

  // gots to change the primary key as well
  const [prompt, completion] = await Promise.all([
    data.resourceusages.get({
      id: getKey(
        'openai/gpt-4-1106-preview/promptTokensUsed/workspaces',
        workspaceId
      ),
    }),
    data.resourceusages.get({
      id: getKey(
        'openai/gpt-4-1106-preview/completionTokensUsed/workspaces',
        workspaceId
      ),
    }),
  ]);

  if (prompt != null) {
    await incrementTableField(
      data.resourceusages,
      prompt.id,
      CONSUMPTION,
      -prompt.consumption
    );
    await data.resourceusagehistory.put({
      id: nanoid(),
      createdAt: timestamp(),

      resource_uri: getResourceUri(workspaceId),
      resourceusage_id: prompt.id,

      consumption: prompt.consumption,

      timePeriod: 'month',
    });
  }

  if (completion != null) {
    await incrementTableField(
      data.resourceusages,
      completion.id,
      CONSUMPTION,
      -completion.consumption
    );
    await data.resourceusagehistory.put({
      id: nanoid(),
      createdAt: timestamp(),

      resource_uri: getResourceUri(workspaceId),
      resourceusage_id: completion.id,

      consumption: completion.consumption,

      timePeriod: 'month',
    });
  }
}
