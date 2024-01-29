import { limits } from '@decipad/backend-config';
import {
  COMPLETION_TOKENS_USED,
  PROMPT_TOKENS_USED,
  getResources,
  isPremiumWorkspace,
} from '@decipad/tables';

export const GPT_MODEL = 'gpt-4-1106-preview';

async function getWorkspaceTokensUsed(workspaceId: string): Promise<number> {
  const [promptTokens, completionTokens] = await getResources([
    {
      resource: 'openai',
      subType: GPT_MODEL,
      field: PROMPT_TOKENS_USED,
      consumer: 'workspaces',
      consumerId: workspaceId ?? '',
    },
    {
      resource: 'openai',
      subType: GPT_MODEL,
      field: COMPLETION_TOKENS_USED,
      consumer: 'workspaces',
      consumerId: workspaceId ?? '',
    },
  ]);

  const workspaceTotalTokensUsed =
    (promptTokens?.consumption ?? 0) + (completionTokens?.consumption ?? 0);

  return workspaceTotalTokensUsed;
}

async function getWorkspaceLimit(workspaceId: string): Promise<number> {
  const [promptTokens] = await getResources([
    {
      resource: 'openai',
      subType: GPT_MODEL,
      field: PROMPT_TOKENS_USED,
      consumer: 'workspaces',
      consumerId: workspaceId ?? '',
    },
  ]);

  const isPremium = await isPremiumWorkspace(workspaceId);

  if (promptTokens == null || promptTokens.quotaLimit == null) {
    if (isPremium) {
      return limits().openAiTokensLimit.pro;
    }
    return limits().openAiTokensLimit.free;
  }

  return promptTokens.quotaLimit * limits().tokensToCredits;
}

export async function hasWorkspaceUsedAllCredits(
  workspaceId: string
): Promise<boolean> {
  const tokensUsed = await getWorkspaceTokensUsed(workspaceId);
  const workspaceLimit = await getWorkspaceLimit(workspaceId);

  return tokensUsed > workspaceLimit;
}
