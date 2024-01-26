import { DocSyncEditor } from '@decipad/docsync';
import { FC, useEffect } from 'react';
import { EditorAssistantChat } from '@decipad/editor-ai-assistant';
import { useNotebookStateAndActions } from './hooks';
import { useActiveEditor } from '@decipad/editor-hooks';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { useAiUsage, useNotebookMetaData } from '@decipad/react-contexts';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';

export interface AssistantChatProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
}

const AssistantChat: FC<AssistantChatProps> = ({ notebookId, docsync }) => {
  const actions = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  const editor = useActiveEditor(docsync);
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });
  const {
    updateUsage,
    promptTokensUsed,
    completionTokensUsed,
    tokensQuotaLimit,
  } = useAiUsage();

  const isReadOnly =
    meta.data?.getPadById?.myPermissionType === 'READ' ||
    meta.data?.getPadById?.myPermissionType == null;

  const [isAssistantOpen] = useNotebookMetaData((state) => [state.aiMode]);

  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

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
    const tokensLimit = aiUsage[0]?.quotaLimit ?? quotaLimitFromPlan;

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

  if (isAssistantOpen && !isEmbed && editor && !isReadOnly) {
    return (
      <EditorAssistantChat
        notebookId={notebookId}
        workspaceId={actions.notebook?.workspace?.id ?? ''}
        editor={editor}
        limitPerPlan={quotaLimitFromPlan}
      />
    );
  }

  return null;
};

export default AssistantChat;
