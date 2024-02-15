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
  increaseQuotaLimit: (quotaLimit: number) => void;
};

const AiUsageContext = createContext<AiUsageActions>({
  promptTokensUsed: 0,
  completionTokensUsed: 0,
  tokensQuotaLimit: 0,
  updateUsage: () => {},
  increaseQuotaLimit: () => {},
});

export const AiUsageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [promptTokensUsed, setPromptTokensUsed] = useState(0);
  const [completionTokensUsed, setCompletionTokensUsed] = useState(0);
  const [quotaLimit, setQuotaLimit] = useState(0);

  // TODO: maybe get rid of this completely, and rely purely on graphql.

  const updateUsage = useCallback<AiUsageActions['updateUsage']>((usage) => {
    if (usage.promptTokensUsed != null) {
      setPromptTokensUsed(usage.promptTokensUsed);
    }

    if (usage.completionTokensUsed != null) {
      setCompletionTokensUsed(usage.completionTokensUsed);
    }

    if (usage.tokensQuotaLimit != null) {
      setQuotaLimit(usage.tokensQuotaLimit);
    }
  }, []);

  const increaseQuotaLimit = useCallback<AiUsageActions['increaseQuotaLimit']>(
    (limit) => {
      setQuotaLimit((l) => l + limit);
    },
    []
  );

  return (
    <AiUsageContext.Provider
      value={{
        promptTokensUsed,
        completionTokensUsed,
        tokensQuotaLimit: quotaLimit,
        updateUsage,
        increaseQuotaLimit,
      }}
    >
      {children}
    </AiUsageContext.Provider>
  );
};

export const useAiUsage = () => useContext(AiUsageContext);
