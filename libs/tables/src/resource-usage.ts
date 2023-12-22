import { ResourceUsageRecord } from '@decipad/backendtypes';
import tables, {
  ResourceKeyParams,
  getResourceUsageKey,
  incrementResource,
} from '.';

export const PROMPT_TOKENS_USED = 'promptTokensUsed';
export const COMPLETION_TOKENS_USED = 'completionTokensUsed';

const CONSUMPTION = 'consumption';
const QUOTA_LIMIT = 'quotaLimit';

type UpdateAiProps = {
  consumerType: 'users' | 'workspaces';
  consumerId: string;
  aiModel: 'gpt-4-1106-preview';
  tokensUsed: {
    promptTokensUsed: number;
    completionTokensUsed: number;
  };
  quotaLimit?: number;
};

type UpdateBothAiProps = {
  userId: string;
  workspaceId?: string;
  aiModel: 'gpt-4-1106-preview';
  tokensUsed: {
    promptTokensUsed: number;
    completionTokensUsed: number;
  };
  quotaLimit?: number;
};

export async function insertOrUpdateUsage({
  consumerType,
  consumerId,
  aiModel,
  tokensUsed,
  quotaLimit,
}: UpdateAiProps): Promise<void> {
  const { resourceusages } = await tables();
  const { promptTokensUsed, completionTokensUsed } = tokensUsed;

  const promptCompositeKey = getResourceUsageKey({
    resource: 'openai',
    subType: aiModel,
    field: PROMPT_TOKENS_USED,
    consumer: consumerType,
    consumerId,
  });

  const promptTokenUsedExists = await resourceusages.get({
    id: promptCompositeKey,
  });

  if (promptTokenUsedExists) {
    incrementResource(
      resourceusages,
      promptCompositeKey,
      CONSUMPTION,
      promptTokensUsed
    );

    if (quotaLimit) {
      await resourceusages.put({
        id: promptCompositeKey,
        consumption: promptTokenUsedExists.consumption + promptTokensUsed,
        [QUOTA_LIMIT]: quotaLimit,
      });
    }
  } else {
    await resourceusages.put({
      id: promptCompositeKey,
      consumption: promptTokensUsed,
      ...(quotaLimit && { [QUOTA_LIMIT]: quotaLimit }),
    });
  }

  const completionCompositeKey = getResourceUsageKey({
    resource: 'openai',
    subType: aiModel,
    field: COMPLETION_TOKENS_USED,
    consumer: consumerType,
    consumerId,
  });
  const completionTokensUsedExists = await resourceusages.get({
    id: completionCompositeKey,
  });

  if (completionTokensUsedExists) {
    incrementResource(
      resourceusages,
      completionCompositeKey,
      CONSUMPTION,
      promptTokensUsed
    );

    if (quotaLimit) {
      await resourceusages.put({
        id: completionCompositeKey,
        consumption: completionTokensUsedExists.consumption + promptTokensUsed,
        [QUOTA_LIMIT]: quotaLimit,
      });
    }
  } else {
    await resourceusages.put({
      id: completionCompositeKey,
      consumption: completionTokensUsed,
      ...(quotaLimit && { [QUOTA_LIMIT]: quotaLimit }),
    });
  }
}

export async function updateWorkspaceAndUserResourceUsage({
  userId,
  workspaceId,
  aiModel,
  tokensUsed,
  quotaLimit,
}: UpdateBothAiProps): Promise<void> {
  await Promise.all([
    insertOrUpdateUsage({
      consumerType: 'users',
      consumerId: userId,
      tokensUsed,
      aiModel,
      quotaLimit,
    }),
    workspaceId != null
      ? insertOrUpdateUsage({
          consumerType: 'workspaces',
          consumerId: workspaceId,
          tokensUsed,
          aiModel,
          quotaLimit,
        })
      : null,
  ]);
}

export async function getResources(
  keys: Array<ResourceKeyParams>
): Promise<Array<ResourceUsageRecord | undefined>> {
  const { resourceusages } = await tables();
  const ids = keys.map(getResourceUsageKey);
  return resourceusages.batchGet(ids);
}

export async function isPremiumWorkspace(
  workspaceId: string
): Promise<boolean> {
  const { workspaces } = await tables();
  const workspace = await workspaces.get({ id: workspaceId });
  return Boolean(workspace?.isPremium);
}
