import { thirdParty, limits } from '@decipad/backend-config';
import type {
  ResourceUsageRecord,
  ResourceUsageTypes,
  User,
} from '@decipad/backendtypes';
import tables, {
  type ResourceKeyParams,
  getResourceUsageKey,
  updateWorkspaceAndUserResourceUsage,
} from '@decipad/tables';
import Stripe from 'stripe';

// TODO: Add to a more generic place.
const GPT_MODEL = 'gpt-4-1106-preview';

const PROMPT_TOKENS_USED = 'promptTokensUsed';
const COMPLETION_TOKENS_USED = 'completionTokensUsed';

export type FrontendAiUsageRecord = ResourceUsageRecord & {
  quotaLimit: number;
  resourceType: ResourceUsageTypes;
};

async function getResources(
  keys: Array<ResourceKeyParams>
): Promise<Array<ResourceUsageRecord | undefined>> {
  const { resourceusages } = await tables();
  const ids = keys.map(getResourceUsageKey);
  return resourceusages.batchGet(ids);
}

export const getAiUsage = async (
  consumer: 'users' | 'workspaces',
  consumerId: string
): Promise<Array<FrontendAiUsageRecord>> => {
  const tokensUsed: Array<ResourceUsageRecord | undefined> = await getResources(
    [
      {
        resource: 'openai',
        subType: GPT_MODEL,
        field: PROMPT_TOKENS_USED,
        consumer,
        consumerId,
      },
      {
        resource: 'openai',
        subType: GPT_MODEL,
        field: COMPLETION_TOKENS_USED,
        consumer,
        consumerId,
      },
    ]
  );

  const { workspaces } = await tables();
  const workspace = await workspaces.get({ id: consumerId });
  const { maxCredits } = limits();
  const maxCreditsPerWs = workspace?.isPremium
    ? maxCredits.pro
    : maxCredits.free;

  return tokensUsed
    .filter((t): t is ResourceUsageRecord => t != null)
    .map((t) => ({
      ...t,
      quotaLimit: t.quotaLimit ?? maxCreditsPerWs,
      resourceType: 'openai',
    }));
};

export const updateExtraAiAllowance = async (
  consumer: 'users' | 'workspaces',
  consumerId: string,
  paymentMethodId: string,
  user: User
) => {
  const stripeConfig = thirdParty().stripe;
  const { secretKey, extraCreditsProdId } = stripeConfig;
  const stripe = new Stripe(secretKey, {
    apiVersion: '2023-08-16',
  });

  const product = await stripe.products.retrieve(extraCreditsProdId);
  /* eslint-disable camelcase */
  const {
    default_price,
    metadata: { credits },
  } = product;
  let price;

  if (typeof default_price === 'string') {
    const priceObj = await stripe.prices.retrieve(default_price);
    price = priceObj.unit_amount ?? 0;
  } else {
    price = default_price?.unit_amount ?? 0;
  }

  await stripe.paymentIntents.create({
    amount: price,
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

  const { workspaces } = await tables();
  const workspace = await workspaces.get({ id: consumerId });
  const { maxCredits } = limits();
  const quotaLimit = workspace?.isPremium ? maxCredits.pro : maxCredits.free;

  const tokensUsed: Array<ResourceUsageRecord | undefined> = await getResources(
    [
      {
        resource: 'openai',
        subType: GPT_MODEL,
        field: PROMPT_TOKENS_USED,
        consumer,
        consumerId,
      },
      {
        resource: 'openai',
        subType: GPT_MODEL,
        field: COMPLETION_TOKENS_USED,
        consumer,
        consumerId,
      },
    ]
  );

  if (tokensUsed.length === 0) {
    await updateWorkspaceAndUserResourceUsage({
      userId: user.id,
      workspaceId: consumerId,
      aiModel: 'gpt-4-1106-preview',
      tokensUsed: {
        completionTokensUsed: 0,
        promptTokensUsed: 0,
      },
      quotaLimit: quotaLimit + Number(credits),
    });

    return {
      newQuotaLimit: quotaLimit + Number(credits),
    };
  }

  let newCredits = 0;

  await Promise.all(
    tokensUsed
      .filter((t): t is ResourceUsageRecord => t != null)
      .map(async (usage) => {
        newCredits = usage.quotaLimit
          ? usage.quotaLimit + Number(credits)
          : quotaLimit + Number(credits);

        await updateWorkspaceAndUserResourceUsage({
          userId: user.id,
          workspaceId: consumerId,
          aiModel: 'gpt-4-1106-preview',
          tokensUsed: {
            completionTokensUsed: 0,
            promptTokensUsed: 0,
          },
          quotaLimit: usage.quotaLimit
            ? usage.quotaLimit + Number(credits)
            : quotaLimit + Number(credits),
        });
      })
  );

  return {
    newQuotaLimit: newCredits,
  };
};
