import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './hooks';
import { MinimalRootEditor } from '@decipad/editor-types';

type EditorAssistantChatProps = {
  notebookId: string;
  controller: MinimalRootEditor;
};

export const EditorAssistantChat: React.FC<EditorAssistantChatProps> = ({
  notebookId,
  controller,
}) => {
  const {
    messages,
    clearChat,
    submitFeedback,
    sendUserMessage,
    regenerateResponse,
    canRegenerateResponse,
    canSubmitFeedback,
    isGeneratingResponse,
    isGeneratingChanges,
  } = useAssistantChat(notebookId, controller);

  return (
    <AssistantChat
      messages={messages}
      submitFeedback={submitFeedback}
      sendMessage={sendUserMessage}
      regenerateResponse={regenerateResponse}
      canRegenerateResponse={canRegenerateResponse}
      canSubmitFeedback={canSubmitFeedback}
      isGeneratingResponse={isGeneratingResponse}
      isGeneratingChanges={isGeneratingChanges}
      clearChat={clearChat}
    />
  );
};
