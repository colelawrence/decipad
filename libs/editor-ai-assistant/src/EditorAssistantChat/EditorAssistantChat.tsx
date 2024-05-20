/* eslint-disable no-underscore-dangle */
import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './useAssistantChat';
import { useResourceUsage } from '@decipad/react-contexts';
import type { MyEditor, MyValue } from '@decipad/editor-types';
import { useCallback } from 'react';
import type { EElementOrText } from '@udecode/plate-common';
import { insertNodes } from '@udecode/plate-common';
import { setSelection } from '@decipad/editor-utils';

type EditorAssistantChatProps = {
  notebookId: string;
  workspaceId: string;
  editor: MyEditor;
};

export const EditorAssistantChat: React.FC<EditorAssistantChatProps> = ({
  notebookId,
  workspaceId,
  editor,
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

  const { ai } = useResourceUsage();

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
      aiCreditsUsed={ai.usage}
      aiQuotaLimit={ai.quotaLimit}
      isFirstInteraction={isFirstInteraction}
    />
  );
};
