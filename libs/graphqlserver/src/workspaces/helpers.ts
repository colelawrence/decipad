import { limits } from '@decipad/backend-config';
import Boom from '@hapi/boom';
import { subscriptions } from '@decipad/services';
import { nanoid } from 'nanoid';
import type { User } from '@decipad/backendtypes';

interface MaybeThrowProps {
  isInternal: boolean;
  hasFreeWorkspace: boolean;
}

/**
 * A wrapper for slighly complicated logic, that can be easily confused.
 *
 * @throws Boom.fobidden
 */
export function maybeThrowForbidden({
  isInternal,
  hasFreeWorkspace,
}: MaybeThrowProps): void {
  if (isInternal || !hasFreeWorkspace) {
    return;
  }

  throw Boom.forbidden(
    'User already has a free workspace. Cannot create another'
  );
}

export async function getPlanInfoFromStripe(currentPlan: string) {
  // Stripe is disabled, return mock data for free plan
  if (currentPlan === 'free') {
    return {
      metadata: {
        key: 'free',
        credits: limits().maxCredits.free.toString(),
        queries: limits().maxQueries.free.toString(),
        editors: limits().maxCollabEditors.free.toString(),
        readers: limits().maxCollabReaders.free.toString(),
        storage: limits().storage.free.toString(),
      },
    };
  }

  throw Boom.failedDependency(
    `Plan ${currentPlan} is not available. Payment processing is disabled`
  );
}

const nameMappings: Record<
  subscriptions.StripeMetadata['key'],
  'free' | 'testPlus' | 'testBusiness'
> = {
  free: 'free',
  pro: 'testPlus',
  personal: 'testPlus',
  team: 'testBusiness',
  enterprise: 'testBusiness',
};

/**
 * Creates a workspace and a subscription record for testings.
 * We don't have a 1-1 mapping with stripe as stripe can change
 * fairly often, but this is enough to replicate functionality..
 */
export async function createTestWorkspaceSubscription(
  user: User,
  workspaceId: string,
  subscriptionType: subscriptions.StripeMetadata['key']
): Promise<void> {
  const subLimits = limits();

  const limitSubscription = nameMappings[subscriptionType];

  await subscriptions.createWorkspaceSubscription({
    subscription: nanoid(),
    client_reference_id: workspaceId,
    payment_status: 'paid',
    customer_details: {
      email: user.email!,
    },
    metadata: {
      key: subscriptionType,
      credits: subLimits.maxCredits[limitSubscription],
      seats: subLimits.maxCollabEditors[limitSubscription],

      storage: subLimits.storage[limitSubscription],
      queries: subLimits.maxQueries[limitSubscription],

      readers: subLimits.maxCollabReaders[limitSubscription],
      editors: subLimits.maxCollabEditors[limitSubscription],
    } satisfies subscriptions.StripeMetadata,
  });
}
