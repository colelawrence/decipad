import { Stripe } from 'stripe';
import { limits, thirdParty } from '@decipad/backend-config';
import Boom from '@hapi/boom';
import { subscriptions } from '@decipad/services';
import { nanoid } from 'nanoid';
import type { User } from '@decipad/backendtypes';

interface MaybeThrowProps {
  isInternal: boolean;
  hasFreeWorkspace: boolean;
}

const { secretKey, apiVersion, subscriptionsProdId } = thirdParty().stripe;
const stripe = new Stripe(secretKey, {
  apiVersion,
});

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
  const subsPlan = (
    await stripe.prices.list({
      product: subscriptionsProdId,
      active: true,
      type: 'recurring',
    })
  ).data.find((plan) => plan.metadata.key === currentPlan);

  if (!subsPlan) {
    throw Boom.failedDependency(
      `Plan ${currentPlan} does not exist in Stripe. Please check configuration`
    );
  }

  return subsPlan;
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
      address: null,
      name: user.name,
      phone: null,
      tax_ids: null,
      tax_exempt: null,
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
