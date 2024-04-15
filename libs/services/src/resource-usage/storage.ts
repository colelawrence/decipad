import type { ResourceTrackerInserter } from './types';
import * as subscriptions from '../subscriptions';
import { limits } from '@decipad/backend-config';
import { getDefined } from '@decipad/utils';
import type { StorageSubtypes } from '@decipad/backendtypes';
import { getKey, getResourceUsageRecords, upsertResourceUsage } from './common';
import { paymentRequired } from '@hapi/boom';

const MEGABYTE = 1_000_000;

type StorageConsumption = { type: StorageSubtypes; consumption: number };

export class StorageTracker
  implements ResourceTrackerInserter<StorageSubtypes, StorageConsumption>
{
  async getUsage(workspaceId: string): Promise<number> {
    const [files] = await getResourceUsageRecords(
      getKey('storage/files/null/workspaces', workspaceId)
    );

    const totalAttachmentsSizes = files?.consumption ?? 0;

    return totalAttachmentsSizes / MEGABYTE;
  }

  async getLimit(workspaceId: string): Promise<number> {
    const [subscription, isPremium] = await Promise.all([
      subscriptions.getWsSubscription(workspaceId),
      subscriptions.isPremiumWorkspace(workspaceId),
    ]);

    if (subscription == null) {
      const plan = isPremium ? 'pro' : 'free';
      return limits().storage[plan];
    }

    return getDefined(subscription.storage);
  }

  async hasReachedLimit(workspaceId: string): Promise<boolean> {
    const [workspaceUsage, workspaceLimit] = await Promise.all([
      this.getUsage(workspaceId),
      this.getLimit(workspaceId),
    ]);

    return workspaceUsage >= workspaceLimit;
  }

  async upsert(
    workspaceId: string,
    field: StorageSubtypes,
    consumption: number
  ): Promise<void> {
    const key = getKey(`storage/${field}/null/workspaces`, workspaceId);

    if (await this.hasReachedLimit(workspaceId)) {
      throw paymentRequired('Reached limit on storage');
    }

    const currentStorage = await this.getUsage(workspaceId);

    await upsertResourceUsage(key, Math.max(0, currentStorage - consumption));
  }

  async updateWorkspaceAndUser(props: {
    workspaceId?: string;
    userId?: string;
    padId?: string;
    usage?: StorageConsumption;
  }): Promise<void> {
    if (props.usage == null) {
      return;
    }

    if (props.workspaceId) {
      await upsertResourceUsage(
        getKey(
          `storage/${props.usage.type}/null/workspaces`,
          props.workspaceId
        ),
        props.usage.consumption
      );
    }

    if (props.userId) {
      await upsertResourceUsage(
        getKey(`storage/${props.usage.type}/null/users`, props.userId),
        props.usage.consumption
      );
    }

    if (props.padId) {
      await upsertResourceUsage(
        getKey(`storage/${props.usage.type}/null/pads`, props.padId),
        props.usage.consumption
      );
    }
  }
}
