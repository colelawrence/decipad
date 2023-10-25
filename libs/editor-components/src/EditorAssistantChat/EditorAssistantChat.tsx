import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './hooks';
import { EditorController } from '@decipad/notebook-tabs';

type EditorAssistantChatProps = {
  notebookId: string;
  controller: EditorController;
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
