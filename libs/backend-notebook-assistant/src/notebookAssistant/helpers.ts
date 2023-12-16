import { ResourceUsageRecord } from '@decipad/backendtypes';
import tables, {
  ResourceKeyParams,
  getResourceUsageKey,
  incrementResource,
} from '@decipad/tables';

export const PROMPT_TOKENS_USED = 'promptTokensUsed';
export const COMPLETION_TOKENS_USED = 'completionTokensUsed';

const CONSUMPTION = 'consumption';

type UpdateAiProps = {
  consumerType: 'users' | 'workspaces';
  consumerId: string;
  aiModel: 'gpt-4-1106-preview';
  tokensUsed: {
    promptTokensUsed: number;
    completionTokensUsed: number;
  };
};

type UpdateBothAiProps = {
  userId: string;
  workspaceId?: string;
  aiModel: 'gpt-4-1106-preview';
  tokensUsed: {
    promptTokensUsed: number;
    completionTokensUsed: number;
  };
};

export async function insertOrUpdateUsage({
  consumerType,
  consumerId,
  aiModel,
  tokensUsed,
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
  } else {
    await resourceusages.put({
      id: promptCompositeKey,
      consumption: promptTokensUsed,
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
  } else {
    await resourceusages.put({
      id: completionCompositeKey,
      consumption: completionTokensUsed,
    });
  }
}

export async function updateWorkspaceAndUserResourceUsage({
  userId,
  workspaceId,
  aiModel,
  tokensUsed,
}: UpdateBothAiProps): Promise<void> {
  await Promise.all([
    insertOrUpdateUsage({
      consumerType: 'users',
      consumerId: userId,
      tokensUsed,
      aiModel,
    }),
    workspaceId != null
      ? insertOrUpdateUsage({
          consumerType: 'workspaces',
          consumerId: workspaceId,
          tokensUsed,
          aiModel,
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
