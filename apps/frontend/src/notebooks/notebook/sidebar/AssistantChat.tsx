import type { FC } from 'react';
import { useEffect } from 'react';
import { EditorAssistantChat } from '@decipad/editor-ai-assistant';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { useAiUsage } from '@decipad/react-contexts';
import { useNotebookStateAndActions } from '../hooks';
import type { SidebarComponentProps } from './types';

const AssistantChat: FC<SidebarComponentProps> = ({
  notebookId,
  docsync,
  editor,
}) => {
  const actions = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const {
    updateUsage,
    promptTokensUsed,
    completionTokensUsed,
    tokensQuotaLimit,
  } = useAiUsage();

  const quotaLimitFromPlan =
    actions.notebook?.workspace?.workspaceSubscription?.credits ?? 0;

  useEffect(() => {
    const workspace = meta.data?.getPadById?.workspace;
    const usageList = workspace?.resourceUsages ?? [];

    const aiUsage = usageList.filter((u) => u?.resourceType === 'openai') ?? [];
    const promptTokens =
      aiUsage.find((u) => u?.id.includes('prompt'))?.consumption ?? 0;
    const completionTokens =
      aiUsage.find((u) => u?.id.includes('completion'))?.consumption ?? 0;

    // TODO: fix
    const tokensLimit = quotaLimitFromPlan;

    // we only want to update the usage with the DB values when the user refreshes the page
    if (!promptTokensUsed && !completionTokensUsed && !tokensQuotaLimit) {
      updateUsage({
        promptTokensUsed: promptTokens,
        completionTokensUsed: completionTokens,
        tokensQuotaLimit: tokensLimit,
      });
    }
  }, [
    updateUsage,
    meta.data?.getPadById?.workspace,
    promptTokensUsed,
    completionTokensUsed,
    tokensQuotaLimit,
    quotaLimitFromPlan,
  ]);

  return (
    <EditorAssistantChat
      notebookId={notebookId}
      workspaceId={actions.notebook?.workspace?.id ?? ''}
      editor={editor}
      limitPerPlan={quotaLimitFromPlan}
    />
  );
};

export default AssistantChat;
