import { type ResourceUsageRecord, type User } from '@decipad/backendtypes';
import type { ResourceTypes } from '@decipad/graphqlserver-types';
import { resourceusage } from '@decipad/services';

export type FrontendResourceUsageRecord = ResourceUsageRecord & {
  resourceType: ResourceTypes;
};

const getResourceTracker = (
  type: ResourceTypes
): resourceusage.ResourceTracker => {
  switch (type) {
    case 'openai':
      return resourceusage.ai;
    case 'queries':
      return resourceusage.queries;
    case 'storage':
      return resourceusage.storage;
  }
};

export const getResourceUsage = async (
  resourceType: ResourceTypes,
  workspaceId: string
): Promise<FrontendResourceUsageRecord> => {
  const tracker = getResourceTracker(resourceType);
  const usage = await tracker.getUsage(workspaceId);

  return {
    id: `${resourceType}-${workspaceId}`,
    consumption: usage,
    resourceType,
  };
};

export const updateExtraAiAllowance = async (
  consumer: 'users' | 'workspaces',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _consumerId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _paymentMethodId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _user: User
) => {
  if (consumer === 'users') {
    throw new Error('Not implemented: we only do this on workspace level');
  }

  // Stripe is disabled, throw error
  throw new Error('Payment processing is currently disabled');
};
