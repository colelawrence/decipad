import { SubscriptionPlansNames } from '@decipad/graphqlserver-types';
import tables from '@decipad/tables';

const PLANS: Record<SubscriptionPlansNames, number> = {
  free: 0,
  pro: 1,
  personal: 1,
  team: 2,
  enterprise: 3,
};

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
  const data = await tables();
  const workspace = await data.workspaces.get({ id: workspaceId });
  if (workspace == null) {
    throw new Error('Workspace not found');
  }

  const wsPlan = workspace?.plan ?? (workspace?.isPremium ? 'pro' : 'free');

  return PLANS[wsPlan] >= PLANS[plan];
}

/**
 * Checks if a workspace is `team` or `enterprise` plan based on a padId.
 *
 * @throws If pad/workspace are not found.
 */
export async function isTeamOrEnterpriseWs(padId: string): Promise<boolean> {
  const data = await tables();
  const pad = await data.pads.get({ id: padId });
  if (pad == null || pad.workspace_id == null) {
    throw new Error('Pad not found');
  }

  const [isTeam, isEnterprise] = await Promise.all([
    isWsPlan(pad.workspace_id, 'team'),
    isWsPlan(pad.workspace_id, 'enterprise'),
  ]);

  return isTeam || isEnterprise;
}
