import { useAIChatHistory } from '@decipad/react-contexts';
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
  const [clearMessages, rateResponse] = useAIChatHistory((state) => [
    state.clearMessages,
    state.rateResponse,
  ]);

  const {
    messages,
    sendUserMessage,
    regenerateResponse,
    loading,
    makeChanges,
  } = useAssistantChat(notebookId, controller);

  return (
    <AssistantChat
      messages={messages}
      sendMessage={sendUserMessage}
      regenerateResponse={regenerateResponse}
      suggestChanges={makeChanges}
      loading={loading}
      clearMessages={clearMessages(notebookId)}
      rateResponse={rateResponse(notebookId)}
    />
  );
};
