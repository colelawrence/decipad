/* eslint-disable no-underscore-dangle */
import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './useAssistantChat';
import { useAiUsage } from '@decipad/react-contexts';
import { MyEditor, MyValue } from '@decipad/editor-types';
import { useCallback } from 'react';
import { EElementOrText, insertNodes } from '@udecode/plate-common';
import { setSelection } from '@decipad/editor-utils';
import { TOKENS_TO_CREDITS } from './limits';

type EditorAssistantChatProps = {
  notebookId: string;
  workspaceId: string;
  editor: MyEditor;
  limitPerPlan: number;
};

export const EditorAssistantChat: React.FC<EditorAssistantChatProps> = ({
  notebookId,
  workspaceId,
  editor,
  limitPerPlan,
}) => {
  const {
    messages,
    clearChat,
    sendUserMessage,
    stopGenerating,
    regenerateResponse,
    isGeneratingResponse,
    isFirstInteraction,
    currentUserMessage,
  } = useAssistantChat(notebookId);

  const { promptTokensUsed, completionTokensUsed, tokensQuotaLimit } =
    useAiUsage();

  const limit = tokensQuotaLimit ?? limitPerPlan;
  const creditsUsed = Math.floor(
    (promptTokensUsed + completionTokensUsed) / TOKENS_TO_CREDITS
  );

  // eslint-disable-next-line no-underscore-dangle
  const _insertNodes = useCallback(
    (node: EElementOrText<MyValue> | EElementOrText<MyValue>[]) => {
      const path = editor.selection?.anchor.path[0] || 1;
      insertNodes(editor, node, {
        at: [path],
      });
      const anchor = { offset: 0, path: [path, 0] };
      setTimeout(() => setSelection(editor, { anchor, focus: anchor }), 0);
    },
    [editor]
  );

  return (
    <AssistantChat
      notebookId={notebookId}
      workspaceId={workspaceId}
      messages={messages}
      sendMessage={sendUserMessage}
      clearChat={clearChat}
      stopGenerating={stopGenerating}
      regenerateResponse={regenerateResponse}
      isGenerating={isGeneratingResponse}
      currentUserMessage={currentUserMessage}
      insertNodes={_insertNodes}
      aiCreditsUsed={creditsUsed}
      aiQuotaLimit={limit}
      isFirstInteraction={isFirstInteraction}
    />
  );
};
