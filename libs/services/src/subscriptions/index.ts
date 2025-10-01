/* eslint-disable camelcase */
import { limits } from '@decipad/backend-config';
import type {
  PermissionType,
  WorkspaceRecord,
  WorkspaceSubscriptionRecord,
} from '@decipad/backendtypes';
import type {
  SubscriptionPlansNames,
  UserAccess,
} from '@decipad/graphqlserver-types';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { z } from 'zod';
import { create } from '../workspaces/create';

const PLANS: Record<SubscriptionPlansNames, number> = {
  free: 0,
  pro: 1,
  personal: 1,
  team: 2,
  enterprise: 3,
};

async function createWorkspace(
  client_reference_id: string
): Promise<WorkspaceRecord> {
  const data = await tables();

  //
  // client_reference_id could be 2 things:
  // - workspaceID
  // - userID
  //
  // First, we check if it is a workspace ID, if so we simply create a subscription
  // and link it to that workspace.
  //
  // If its a userID, we create a workspace and insert the user into the workspace as an admin.
  // And then add the subscription to this brain new workspace.
  //

  const workspace = await data.workspaces.get({ id: client_reference_id });
  if (workspace != null) {
    return workspace;
  }

  const user = await data.users.get({ id: client_reference_id });
  if (user == null) {
    throw Boom.badRequest('User is not valid');
  }

  return create({ name: `${user.name}'s Workspace` }, user);
}

async function getWorkspaceSubscription(
  workspaceId: string
): Promise<Array<WorkspaceSubscriptionRecord>> {
  const data = await tables();

  return data.workspacesubscriptions
    .query({
      IndexName: 'byWorkspace',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': workspaceId,
      },
    })
    .then((c) => c.Items);
}

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
export async function canUserBeInvitedWithPermission(
  padId: string,
  permissionType: PermissionType,
  accessList: UserAccess[],
  isNewPaymentsEnabled = false
): Promise<boolean> {
  const maxEditorFreePlan = limits().maxCollabReaders.free;
  const wsPlan = await getWsPlanFromPad(padId);

  const nrOfCollaborators = accessList.filter(
    (accessUser) => accessUser.permission === permissionType
  ).length;

  if (isNewPaymentsEnabled) {
    if (permissionType === 'READ' && PLANS[wsPlan] >= PLANS.team) {
      return true;
    }

    /*
     * some workspaces in production don't have a plan name, it means it is a free
     * subscription but we haven't had time to migrate these workspaces
     */
    if (!wsPlan || wsPlan === 'free') {
      if (permissionType !== 'READ') {
        return false;
      }

      return nrOfCollaborators < maxEditorFreePlan;
    }

    // Stripe is disabled, use default limits
    if (permissionType === 'WRITE') {
      // according to requirements, the owner of the notebook counts as an editor
      return nrOfCollaborators < limits().maxCollabEditors.free - 1;
    }

    return nrOfCollaborators < limits().maxCollabReaders.free;
  }

  return true;
}

/**
 * Return the subscription for a specific workspace
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
    throw new Error(
      `Workspace with id ${workspaceId} should have 1 subscription and has ${workspaceSubscription.length}`
    );
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

const planValidator = z.union([
  z.literal<SubscriptionPlansNames>('free'),
  z.literal<SubscriptionPlansNames>('personal'),
  z.literal<SubscriptionPlansNames>('team'),
  z.literal<SubscriptionPlansNames>('enterprise'),

  // Legacy plans.
  z.literal('pro'),
]);

const nonNegativeString = z.preprocess(
  (val) => Number(val),
  z.number().nonnegative()
);

const metadataValidator = z.object({
  key: planValidator,
  credits: nonNegativeString,
  seats: nonNegativeString,
  storage: nonNegativeString,
  queries: nonNegativeString,
  readers: nonNegativeString,
  editors: nonNegativeString,
});

export type StripeMetadata = z.infer<typeof metadataValidator>;

type StripeOptions = {
  metadata: unknown;
  client_reference_id: string | null;
  payment_status: string | null;
  customer_details: { email?: string } | null;
  subscription: string | { id: string } | null;
};

/**
 * Used for testing.
 */
export function getMetadata(
  metadata: z.infer<typeof metadataValidator>
): z.infer<typeof metadataValidator> {
  return metadata;
}

export async function createWorkspaceSubscription({
  subscription,
  client_reference_id,
  payment_status,
  customer_details,
  metadata,
}: StripeOptions): Promise<{ subscriptionId: string; workspaceId: string }> {
  const validateMetadata = metadataValidator.safeParse(metadata);

  if (!validateMetadata.success) {
    throw Boom.badRequest(
      'Webhook error: Metadata Object is invalid. Subscription not created.'
    );
  }

  const validMetadata = validateMetadata.data;

  let plan: z.infer<typeof planValidator> = 'free';
  if (payment_status === 'paid') {
    plan = validMetadata.key ?? 'pro';
  }

  if (client_reference_id == null) {
    throw Boom.badRequest('Webhook error: client_reference_id cannot be null');
  }

  const email = customer_details?.email;
  if (email == null) {
    throw Boom.badRequest('Webhook error: customer email was invalid');
  }

  const subscriptionId =
    typeof subscription === 'string' ? subscription : subscription?.id;
  if (subscriptionId == null) {
    throw Boom.badRequest('Webhook error: SubscriptionID cannot be null');
  }

  const workspace = await createWorkspace(client_reference_id);

  const workspaceSub = await getWorkspaceSubscription(workspace.id);
  if (workspaceSub.length !== 0) {
    throw Boom.conflict(`
      Webhook error: Workspace already has subscription.
        - This means the user has PAID for the subscription.
        - And we failed!
    `);
  }

  const data = await tables();

  await data.workspacesubscriptions.put({
    id: subscriptionId,
    workspace_id: workspace.id,
    clientReferenceId: client_reference_id,
    paymentStatus: payment_status,
    credits: validMetadata.credits,
    queries: validMetadata.queries,
    editors: validMetadata.editors,
    readers: validMetadata.readers,
    // TODO: remove this field - deprecated
    seats: validMetadata.seats,
    storage: validMetadata.storage,
    email,
  });

  await data.workspaces.put({
    ...workspace,
    isPremium: payment_status === 'paid',
    plan,
  });

  return { workspaceId: workspace.id, subscriptionId };
}
