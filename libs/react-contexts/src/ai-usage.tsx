import { AiUsage } from '@decipad/interfaces';
import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const AiUsageContext = createContext<
  AiUsage & {
    updateUsage: (usage: AiUsage) => void;
  }
>({
  promptTokensUsed: 0,
  completionTokensUsed: 0,
  updateUsage: () => {},
});

export const AiUsageProvider: FC<AiUsage & { children: JSX.Element }> = ({
  promptTokensUsed,
  completionTokensUsed,
  children,
}) => {
  const [promptTokensUsedClient, setPromptTokensUsedClient] =
    useState(promptTokensUsed);
  const [completionTokensUsedClient, setCompletionTokensUsedClient] =
    useState(completionTokensUsed);

  useEffect(() => {
    setPromptTokensUsedClient(promptTokensUsed);
    setCompletionTokensUsedClient(completionTokensUsed);
  }, [completionTokensUsed, promptTokensUsed]);

  const updateUsage = useCallback((usage: AiUsage) => {
    setPromptTokensUsedClient(usage.promptTokensUsed);
    setCompletionTokensUsedClient(usage.completionTokensUsed);
  }, []);

  return (
    <AiUsageContext.Provider
      value={{
        promptTokensUsed: promptTokensUsedClient,
        completionTokensUsed: completionTokensUsedClient,
        updateUsage,
      }}
    >
      {children}
    </AiUsageContext.Provider>
  );
};

export const useAiUsage = () => useContext(AiUsageContext);
