import type {
  AiFields,
  ResourceConsumer,
  ResourceUsageHistoryRecord,
  ResourceUsageRecord,
} from '@decipad/backendtypes';
import type { ResourceTrackerInserterWithCreditsAndReset } from './types';
import {
  CONSUMPTION,
  ORIGINAL_AMOUNT,
  getKey,
  getResourceUri,
  getResourceUsageRecords,
  getUsageRecord,
  upsertResourceUsage,
} from './common';
import * as subscriptions from '../subscriptions';
import { limits } from '@decipad/backend-config';
import { getDefined } from '@decipad/utils';
import { paymentRequired } from '@hapi/boom';
import tables, { incrementTableField, timestamp } from '@decipad/tables';
import { nanoid } from 'nanoid';
import type { CompletionUsage } from 'openai/resources';

export class AiResourceTracker
  implements
    ResourceTrackerInserterWithCreditsAndReset<AiFields, CompletionUsage>
{
  private getExtraAiRecord(
    workspaceId: string
  ): Promise<ResourceUsageRecord | undefined> {
    return getUsageRecord('openai/extra-credits/null/workspaces', workspaceId);
  }

  /**
   * @note returns credits NOT TOKENs
   */
  private async getAiUsageWithoutExtraCredits(
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

  async getRemainingExtraCredits(workspaceId: string): Promise<number> {
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

  async getLimit(workspaceId: string): Promise<number> {
    const [subscription, isPremium] = await Promise.all([
      subscriptions.getWsSubscription(workspaceId),
      subscriptions.isPremiumWorkspace(workspaceId),
    ]);

    const extraAiCredits = await this.getRemainingExtraCredits(workspaceId);

    if (subscription == null) {
      const plan = isPremium ? 'pro' : 'free';
      return (
        limits().openAiTokensLimit[plan] / limits().tokensToCredits +
        extraAiCredits
      );
    }

    return getDefined(subscription.credits) + extraAiCredits;
  }

  async getUsage(workspaceId: string): Promise<number> {
    const [extraAi, aiUsage] = await Promise.all([
      this.getExtraAiRecord(workspaceId),
      this.getAiUsageWithoutExtraCredits(workspaceId),
    ]);

    const extraAiConsumption = extraAi?.consumption ?? 0;

    return extraAiConsumption + aiUsage;
  }

  async upsertExtra(workspaceId: string, credits: number): Promise<void> {
    if (credits <= 0) {
      throw new Error('You cannot create extra credits with 0 or less');
    }

    const extraCreditsKey = getKey(
      'openai/extra-credits/null/workspaces',
      workspaceId
    );

    const exists = await this.getExtraAiRecord(workspaceId);

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

  async upsert(
    workspaceId: string,
    field: AiFields,
    consumption: number
  ): Promise<void> {
    const aiKey = getKey(
      `openai/gpt-4-1106-preview/${field}/workspaces`,
      workspaceId
    );

    const [wsLimits, usage, extraCredits] = await Promise.all([
      this.getLimit(workspaceId),
      this.getAiUsageWithoutExtraCredits(workspaceId),
      this.getRemainingExtraCredits(workspaceId),
    ]);

    if (usage < wsLimits - extraCredits) {
      await upsertResourceUsage(aiKey, consumption);
      return;
    }

    //
    // We have reached our subscription limit. Let's check if we have
    // any extra credits or reached a limit.
    //

    const extraAi = await this.getExtraAiRecord(workspaceId);

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

  async hasReachedLimit(workspaceId: string): Promise<boolean> {
    const [workspaceUsage, workspaceLimit] = await Promise.all([
      this.getUsage(workspaceId),
      this.getLimit(workspaceId),
    ]);

    return workspaceUsage >= workspaceLimit;
  }

  async reset(workspaceId: string): Promise<void> {
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

  async updateWorkspaceAndUser({
    workspaceId,
    userId,
    usage,
  }: Parameters<
    ResourceTrackerInserterWithCreditsAndReset<
      AiFields,
      CompletionUsage
    >['updateWorkspaceAndUser']
  >[0]): Promise<void> {
    const updates: Array<Promise<unknown>> = [];

    if (usage == null) {
      return;
    }

    if (workspaceId != null) {
      updates.push(
        this.upsert(workspaceId, 'promptTokensUsed', usage.prompt_tokens),
        this.upsert(
          workspaceId,
          'completionTokensUsed',
          usage.completion_tokens
        )
      );
    }

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
  const [prompt, completion] = await getResourceUsageRecords(
    promptKey,
    completionKey
  );

  return [prompt?.consumption ?? 0, completion?.consumption ?? 0];
}
