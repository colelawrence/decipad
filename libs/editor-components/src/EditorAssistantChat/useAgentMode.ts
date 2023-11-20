import { AIMode, Message, useAISettings } from '@decipad/react-contexts';
import { useCallback } from 'react';
import { AgentAPIPayload, ModePossibility } from './types';
import { ChatCompletionMessage } from 'openai/resources';
import { mapChatHistoryToGPTChat } from './helpers';

type AgentModeOptions = {
  notebookId: string;
};

export const useAgentMode = ({ notebookId }: AgentModeOptions) => {
  const [aiConfig] = useAISettings((state) => [state.aiConfig]);

  const agentConfig = aiConfig.autoMode;

  const selectAgentMode = useCallback(
    async (messages: Message[]) => {
      const body: AgentAPIPayload = {
        messages: mapChatHistoryToGPTChat(messages),
        agent: 'auto',
        config: agentConfig,
      };

      const response = await fetch(`/api/ai/chat/${notebookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status !== 200) {
        const err = await response.json();

        throw new Error(err.message);
      }

      const message: ChatCompletionMessage = await response.json();

      const parsedContent: ModePossibility = JSON.parse(
        message.content || '{}'
      );

      let newMode: AIMode = 'ask';

      if (parsedContent.conversation >= 0.5) {
        newMode = 'ask';
      } else if (parsedContent.modelling >= 0.5) {
        newMode = 'create';
      } else {
        newMode = 'ask';
      }

      return newMode;
    },
    [agentConfig, notebookId]
  );

  return {
    selectAgentMode,
  };
};
