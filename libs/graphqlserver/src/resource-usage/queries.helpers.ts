import { thirdParty } from '@decipad/backend-config';
import {
  type ResourceUsageRecord,
  type User,
  type ResourceConsumer,
} from '@decipad/backendtypes';
import { ResourceTypes } from '@decipad/graphqlserver-types';
import { resourceusage } from '@decipad/services';
import Stripe from 'stripe';

export type FrontendResourceUsageRecord = ResourceUsageRecord & {
  resourceType: ResourceTypes;
};

//
// TODO: Frontend doesnt need raw UsageRecords, nor does it need individual tokens.
//

export const getAiUsage = async (
  consumer: ResourceConsumer,
  consumerId: string
): Promise<Array<FrontendResourceUsageRecord>> => {
  const records = await Promise.all([
    resourceusage.getUsageRecord(
      `openai/gpt-4-1106-preview/promptTokensUsed/${consumer}`,
      consumerId
    ),
    resourceusage.getUsageRecord(
      `openai/gpt-4-1106-preview/completionTokensUsed/${consumer}`,
      consumerId
    ),
    resourceusage.getUsageRecord(
      'openai/extra-credits/null/workspaces',
      consumerId
    ),
  ]);

  return records
    .filter((r): r is ResourceUsageRecord => r != null)
    .map((r) => ({ ...r, resourceType: 'openai' }));
};

export const getStorageUsage = async (
  workspaceId: string
): Promise<Array<FrontendResourceUsageRecord>> => {
  const records = await Promise.all([
    resourceusage.getUsageRecord('storage/files/null/workspaces', workspaceId),
    resourceusage.getUsageRecord('storage/images/null/workspaces', workspaceId),
  ]);

  return records
    .filter((r): r is ResourceUsageRecord => r != null)
    .map((r) => ({ ...r, resourceType: 'storage' }));
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

  await resourceusage.insertExtraAi(workspaceId, credits);

  return {
    newQuotaLimit: credits,
  };
};
