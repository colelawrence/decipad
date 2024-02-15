import { WorkspaceSubscriptionRecord } from '@decipad/backendtypes';
import { SubscriptionPlansNames } from '@decipad/graphqlserver-types';
import tables from '@decipad/tables';

const PLANS: Record<SubscriptionPlansNames, number> = {
  free: 0,
  pro: 1,
  personal: 1,
  team: 2,
  enterprise: 3,
};

export async function getWsPlan(
  workspaceId: string
): Promise<SubscriptionPlansNames> {
  const data = await tables();
  const workspace = await data.workspaces.get({ id: workspaceId });
  if (workspace == null) {
    throw new Error('Workspace not found');
  }

  return workspace?.plan ?? (workspace?.isPremium ? 'pro' : 'free');
}

export async function getWsPlanFromPad(
  padId: string
): Promise<SubscriptionPlansNames> {
  const data = await tables();
  const pad = await data.pads.get({ id: padId });
  if (pad == null || pad.workspace_id == null) {
    throw new Error('Pad not found or lacking workspace');
  }

  return getWsPlan(pad.workspace_id);
}

/**
 * Helper function to return if workspace is a certain plan
 * or above.
 *
 * A `team` plan should return true if you ask for `team`, `personal` or `free....`
 *
 * @throws If workspace is not found.
 */
export async function isWsPlan(
  workspaceId: string,
  plan: SubscriptionPlansNames
): Promise<boolean> {
  const wsPlan = await getWsPlan(workspaceId);

  return PLANS[wsPlan] >= PLANS[plan];
}

/**
 * Checks if a workspace is `team` or `enterprise` plan based on a padId.
 *
 * @throws If pad/workspace are not found.
 */
export async function isTeamOrEnterpriseWs(padId: string): Promise<boolean> {
  const wsPlan = await getWsPlanFromPad(padId);

  return PLANS[wsPlan] >= PLANS.team;
}

/**
 * Retusn the subscription for a specific workspace
 *
 * @note it can also return `undefined`, which means no subscription is found.
 * This means its free or legacy pro.
 */
export async function getWsSubscription(
  workspaceId: string
): Promise<WorkspaceSubscriptionRecord | undefined> {
  const data = await tables();

  const workspaceSubscription = (
    await data.workspacesubscriptions.query({
      IndexName: 'byWorkspace',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': workspaceId,
      },
    })
  ).Items;

  if (workspaceSubscription.length === 0) {
    return undefined;
  }

  if (workspaceSubscription.length !== 1) {
    throw new Error('Workspace should only have 1 subscription');
  }

  return workspaceSubscription[0];
}

export async function isPremiumWorkspace(
  workspaceId: string
): Promise<boolean> {
  const data = await tables();
  const ws = await data.workspaces.get({ id: workspaceId });

  return Boolean(ws?.isPremium);
}
