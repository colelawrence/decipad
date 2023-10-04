import { useAIChatHistory } from '@decipad/react-contexts';
import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './hooks';
import { noop } from '@decipad/utils';

type EditorAssistantChatProps = {
  notebookId: string;
};

export const EditorAssistantChat: React.FC<EditorAssistantChatProps> = ({
  notebookId,
}) => {
  const clearMessages = useAIChatHistory((state) => state.clearMessages);
  const rateResponse = useAIChatHistory((state) => state.rateResponse);

  const { messages, sendUserMessage, regenerateResponse, loading } =
    useAssistantChat(notebookId);

  return (
    <AssistantChat
      messages={messages}
      sendMessage={sendUserMessage}
      regenerateResponse={regenerateResponse}
      suggestChanges={noop}
      loading={loading}
      clearMessages={clearMessages(notebookId)}
      rateResponse={rateResponse(notebookId)}
    />
  );
};
