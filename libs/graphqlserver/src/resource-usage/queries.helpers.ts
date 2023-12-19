import { limits } from '@decipad/backend-config';
import type {
  ResourceUsageRecord,
  ResourceUsageTypes,
} from '@decipad/backendtypes';
import tables, {
  type ResourceKeyParams,
  getResourceUsageKey,
} from '@decipad/tables';

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

  return tokensUsed
    .filter((t): t is ResourceUsageRecord => t != null)
    .map((t) => ({
      ...t,
      quotaLimit: limits().openAiTokensLimit.free,
      resourceType: 'openai',
    }));
};
