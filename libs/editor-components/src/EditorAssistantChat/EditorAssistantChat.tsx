import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './hooks';
import { useAISettings, useAiUsage } from '@decipad/react-contexts';
import { MyEditor, MyValue } from '@decipad/editor-types';
import { useCallback } from 'react';
import {
  EElementOrText,
  insertNodes,
  setSelection,
} from '@udecode/plate-common';

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
  const { messages, clearChat, sendUserMessage } = useAssistantChat(
    notebookId,
    editor
  );

  const { promptTokensUsed, completionTokensUsed } = useAiUsage();

  const generatingChatResponse = useAISettings(
    (state) => state.generatingChatResponse
  );
  insertNodes;
  const _insertNodes = useCallback(
    (node: EElementOrText<MyValue> | EElementOrText<MyValue>[]) => {
      const path = editor.selection?.anchor.path[0] || 1;
      insertNodes(editor, node, {
        at: [path],
      });
      const anchor = { offset: 0, path: [path, 0] };
      setTimeout(() => setSelection(editor, { anchor, focus: anchor }), 0);
    },
    []
  );

  return (
    <AssistantChat
      notebookId={notebookId}
      workspaceId={workspaceId}
      messages={messages}
      sendMessage={sendUserMessage}
      clearChat={clearChat}
      isGenerating={generatingChatResponse}
      insertNodes={_insertNodes}
      aiCreditsUsed={promptTokensUsed + completionTokensUsed}
      aiQuotaLimit={aiQuotaLimit}
      isPremium={isPremium}
    />
  );
};
