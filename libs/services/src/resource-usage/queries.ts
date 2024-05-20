import { paymentRequired } from '@hapi/boom';
import {
  CONSUMPTION,
  getKey,
  getResourceUri,
  getUsageRecord,
  upsertResourceUsage,
} from './common';
import * as subscriptions from '../subscriptions';
import type { ResourceTrackerInserterWithReset } from './types';
import type { QuerySubtypes } from '@decipad/backendtypes';
import { limits } from '@decipad/backend-config';
import { getDefined } from '@decipad/utils';
import tables, { incrementTableField, timestamp } from '@decipad/tables';
import { nanoid } from 'nanoid';

export class QueriesResourceTracker
  implements ResourceTrackerInserterWithReset<QuerySubtypes, number>
{
  public async getUsage(workspaceId: string): Promise<number> {
    const queries = await getUsageRecord(
      'queries/queries/null/workspaces',
      workspaceId
    );

    return queries?.consumption ?? 0;
  }

  public async getLimit(workspaceId: string): Promise<number> {
    const [subscription, isPremium] = await Promise.all([
      subscriptions.getWsSubscription(workspaceId),
      subscriptions.isPremiumWorkspace(workspaceId),
    ]);

    if (subscription == null) {
      const plan = isPremium ? 'pro' : 'free';
      return limits().maxQueries[plan];
    }

    return getDefined(subscription.queries);
  }

  // TODO: extract into parent class
  public async hasReachedLimit(workspaceId: string): Promise<boolean> {
    const [workspaceUsage, workspaceLimit] = await Promise.all([
      this.getUsage(workspaceId),
      this.getLimit(workspaceId),
    ]);

    return workspaceUsage >= workspaceLimit;
  }

  public async upsert(
    workspaceId: string,
    field: 'queries',
    consumption: number
  ): Promise<void> {
    if (consumption <= 0) {
      throw new Error('You cannot create extra credits with 0 or less');
    }

    const key = getKey(`queries/${field}/null/workspaces`, workspaceId);

    if (await this.hasReachedLimit(workspaceId)) {
      throw paymentRequired('Reached limit on queries');
    }

    const currentQueries = await this.getUsage(workspaceId);

    await upsertResourceUsage(key, Math.max(0, currentQueries - consumption));
  }

  public async updateWorkspaceAndUser(props: {
    workspaceId?: string | undefined;
    userId?: string;
    padId?: string;
    usage?: number;
  }): Promise<void> {
    if (props.usage == null) {
      return;
    }

    if (props.workspaceId) {
      await upsertResourceUsage(
        getKey(`queries/queries/null/workspaces`, props.workspaceId),
        props.usage
      );
    }

    if (props.userId) {
      await upsertResourceUsage(
        getKey(`queries/queries/null/workspaces`, props.userId),
        props.usage
      );
    }

    if (props.padId) {
      await upsertResourceUsage(
        getKey(`queries/queries/null/workspaces`, props.padId),
        props.usage
      );
    }
  }

  public async reset(workspaceId: string): Promise<void> {
    const data = await tables();

    const queries = await data.resourceusages.get({
      id: getKey('queries/queries/null/workspaces', workspaceId),
    });

    if (queries == null) {
      return;
    }

    await incrementTableField(
      data.resourceusages,
      queries.id,
      CONSUMPTION,
      -queries.consumption
    );

    await data.resourceusagehistory.put({
      id: nanoid(),
      createdAt: timestamp(),

      resource_uri: getResourceUri(workspaceId),
      resourceusage_id: queries.id,

      consumption: queries.consumption,

      timePeriod: 'month',
    });
  }
}
