import { AiUsage } from '@decipad/interfaces';
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

type AiUsageActions = AiUsage & {
  updateUsage: (usage: Partial<AiUsage>) => void;
};

const AiUsageContext = createContext<AiUsageActions>({
  promptTokensUsed: 0,
  completionTokensUsed: 0,
  tokensQuotaLimit: 0,
  updateUsage: () => {},
});

export const AiUsageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [promptTokensUsed, setPromptTokensUsed] = useState(0);
  const [completionTokensUsed, setCompletionTokensUsed] = useState(0);
  const [quotaLimit, setQuotaLimit] = useState(0);

  // TODO: maybe get rid of this completely, and rely purely on graphql.

  const updateUsage = useCallback<AiUsageActions['updateUsage']>((usage) => {
    if (usage.promptTokensUsed) {
      setPromptTokensUsed(usage.promptTokensUsed);
    }

    if (usage.completionTokensUsed) {
      setCompletionTokensUsed(usage.completionTokensUsed);
    }

    if (usage.tokensQuotaLimit != null) {
      setQuotaLimit(usage.tokensQuotaLimit);
    }
  }, []);

  return (
    <AiUsageContext.Provider
      value={{
        promptTokensUsed,
        completionTokensUsed,
        tokensQuotaLimit: quotaLimit,
        updateUsage,
      }}
    >
      {children}
    </AiUsageContext.Provider>
  );
};

export const useAiUsage = () => useContext(AiUsageContext);
