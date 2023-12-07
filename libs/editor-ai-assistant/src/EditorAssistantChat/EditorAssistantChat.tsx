import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './useAssistantChat';
import { useAiUsage } from '@decipad/react-contexts';
import { MyEditor, MyValue } from '@decipad/editor-types';
import { useCallback } from 'react';
import { EElementOrText, insertNodes } from '@udecode/plate-common';
import { setSelection } from '@decipad/editor-utils';

type EditorAssistantChatProps = {
  notebookId: string;
  workspaceId: string;
  editor: MyEditor;
  aiQuotaLimit?: number;
  isPremium?: boolean;
};

export const EditorAssistantChat: React.FC<EditorAssistantChatProps> = ({
  notebookId,
  workspaceId,
  editor,
  aiQuotaLimit,
  isPremium,
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

  const { promptTokensUsed, completionTokensUsed } = useAiUsage();

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
      aiCreditsUsed={promptTokensUsed + completionTokensUsed}
      aiQuotaLimit={aiQuotaLimit}
      isPremium={isPremium}
      isFirstInteraction={isFirstInteraction}
    />
  );
};
