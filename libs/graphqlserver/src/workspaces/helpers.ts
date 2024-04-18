import { Stripe } from 'stripe';
import { app, thirdParty } from '@decipad/backend-config';
import Boom from '@hapi/boom';

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
  //
  // TODO: Change this!
  //
  // We allow users to do this for now but when we release they really
  // shouldnt be able to.
  //
  if (app().environment === 'production') {
    return;
  }

  if (isInternal) {
    return;
  }

  if (!hasFreeWorkspace) {
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
