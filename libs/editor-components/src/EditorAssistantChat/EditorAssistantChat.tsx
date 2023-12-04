import { AssistantChat } from '@decipad/ui';
import { useAssistantChat } from './hooks';
import { useAISettings, useAiUsage } from '@decipad/react-contexts';
import { MyEditor } from '@decipad/editor-types';

type EditorAssistantChatProps = {
  notebookId: string;
  editor: MyEditor;
  aiQuotaLimit?: number;
  isPremium?: boolean;
};

export const EditorAssistantChat: React.FC<EditorAssistantChatProps> = ({
  notebookId,
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

  return (
    <AssistantChat
      messages={messages}
      sendMessage={sendUserMessage}
      clearChat={clearChat}
      isGenerating={generatingChatResponse}
      aiCreditsUsed={promptTokensUsed + completionTokensUsed}
      aiQuotaLimit={aiQuotaLimit}
      isPremium={isPremium}
    />
  );
};
