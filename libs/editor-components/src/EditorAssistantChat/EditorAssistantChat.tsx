import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './hooks';
import { useAISettings } from '@decipad/react-contexts';
import { MyEditor } from '@decipad/editor-types';

type EditorAssistantChatProps = {
  notebookId: string;
  editor: MyEditor;
};

export const EditorAssistantChat: React.FC<EditorAssistantChatProps> = ({
  notebookId,
  editor,
}) => {
  const { messages, clearChat, sendUserMessage } = useAssistantChat(
    notebookId,
    editor
  );

  const generatingChatResponse = useAISettings(
    (state) => state.generatingChatResponse
  );

  return (
    <AssistantChat
      messages={messages}
      sendMessage={sendUserMessage}
      clearChat={clearChat}
      isGenerating={generatingChatResponse}
    />
  );
};
