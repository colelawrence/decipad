import { thirdParty } from '@decipad/backend-config';
import { type ResourceUsageRecord, type User } from '@decipad/backendtypes';
import type { ResourceTypes } from '@decipad/graphqlserver-types';
import { resourceusage } from '@decipad/services';
import Stripe from 'stripe';

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
  consumerId: string,
  paymentMethodId: string,
  user: User
) => {
  if (consumer === 'users') {
    throw new Error('Not implemented: we only do this on workspace level');
  }

  const workspaceId = consumerId;

  const { secretKey, extraCreditsProdId, apiVersion } = thirdParty().stripe;
  const stripe = new Stripe(secretKey, {
    apiVersion,
  });

  // TODO: refactor this when we'll have multiple prices
  const product = (
    await stripe.prices.list({
      product: extraCreditsProdId,
    })
  ).data.find((p) => p.metadata.isDefault === 'true');
  const credits = Number(product?.metadata?.credits ?? 0);

  if (Number.isNaN(credits)) {
    throw new Error(
      'Stripe error: Credits is NaN. VERY SERIOUS, CALL MARTA OR JOHN'
    );
  }

  await stripe.paymentIntents.create({
    /* eslint-disable camelcase */
    amount: product?.unit_amount ?? 0,
    currency: 'usd',
    receipt_email: user.email ?? undefined,
    metadata: {
      product_id: extraCreditsProdId,
      workspace_id: consumerId,
    },
    confirm: true,
    payment_method: paymentMethodId,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
  });

  await resourceusage.ai.upsertExtra(workspaceId, credits);

  return {
    newQuotaLimit: credits,
  };
};
