import tables from '@decipad/tables';
import { limits, plans } from '@decipad/backend-config';
import type { ID } from '@decipad/backendtypes';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type {
  SubscriptionPaymentStatus,
  WorkspaceSubscription,
} from '@decipad/graphqlserver-types';

export const getWorkspaceSubscription = async (
  workspaceId: string
): Promise<WorkspaceSubscription | null> => {
  const data = await tables();
  const workspaceSubs = (
    await data.workspacesubscriptions.query({
      IndexName: 'byWorkspace',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': workspaceId,
      },
    })
  ).Items[0];

  if (workspaceSubs == null) {
    // for now let's return a free subscription dummy
    return {
      id: 'free',
      paymentStatus: 'unpaid',
      queries: limits().maxQueries.free,
      credits: limits().maxCredits.free,
      readers: limits().maxCollabReaders.free,
      storage: limits().storage.free,
      editors: 0,
    };
  }

  // Stripe is disabled, use default limits
  const isProPlan =
    (await data.workspaces.get({ id: workspaceId }))?.plan === plans().pro;

  if (!workspaceSubs.credits && isProPlan) {
    workspaceSubs.credits = limits().maxCredits.pro;
  }

  if (!workspaceSubs.queries && isProPlan) {
    workspaceSubs.queries = limits().maxQueries.pro;
  }

  if (!workspaceSubs.storage && isProPlan) {
    workspaceSubs.storage = limits().storage.pro;
  }

  // Just in case.
  if (workspaceSubs.credits == null) {
    workspaceSubs.credits = limits().maxCredits.free;
  }
  if (workspaceSubs.queries == null) {
    workspaceSubs.queries = limits().maxQueries.free;
  }
  if (workspaceSubs.storage == null) {
    workspaceSubs.storage = limits().storage.free;
  }

  // Cast because the _technical_ type is an enum.
  return {
    ...workspaceSubs,
    paymentStatus: workspaceSubs.paymentStatus as SubscriptionPaymentStatus,
  } as WorkspaceSubscription;
};

export const findSubscriptionByWorkspaceId = async (
  workspaceId: string
): Promise<WorkspaceSubscription> => {
  const data = await tables();

  const workspaces = await data.workspacesubscriptions.query({
    IndexName: 'byWorkspace',
    KeyConditionExpression: 'workspace_id = :workspace_id',
    ExpressionAttributeValues: {
      ':workspace_id': workspaceId,
    },
  });

  if (workspaces.Count === 0) {
    throw new Error('Workspace not found');
  }

  const sub = workspaces.Items[0];

  // Cast because the _technical_ type is an enum.
  return {
    ...sub,
    paymentStatus: sub.paymentStatus as SubscriptionPaymentStatus,
  } as WorkspaceSubscription;
};

export const updateStripeIfNeeded = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _event: APIGatewayProxyEventV2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _subs: WorkspaceSubscription,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _newQuantity: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _workspaceId: string
) => {
  // Stripe is disabled, no-op
};

export const cancelStripeSubscription = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _subscriptionId: ID
) => {
  // Stripe is disabled, no-op
  return null;
};

export const cancelSubscriptionFromWorkspaceId = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _event: APIGatewayProxyEventV2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _workspaceId: ID
) => {
  // Stripe is disabled, no-op
};
