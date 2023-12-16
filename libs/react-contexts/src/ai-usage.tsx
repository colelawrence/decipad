import { AiUsage } from '@decipad/interfaces';
import { FC, createContext, useCallback, useContext, useEffect } from 'react';
import { create } from 'zustand';

const AiUsageContext = createContext<
  AiUsage & {
    updateUsage: (usage: AiUsage) => void;
  }
>({
  promptTokensUsed: 0,
  completionTokensUsed: 0,
  updateUsage: () => {},
});

/**
 * We store is in a store because the user might go back to workspace.
 * at which point we would not do a graphql refetch, and so it would
 * default to whatever the tokens were when the user first loaded the app.
 *
 * Like this we can keep track.
 */
const persistentAiUsage = create<{
  promptTokens: number | undefined;
  completionTokens: number | undefined;
  updateAiTokens: (prompt: number, completion: number) => void;
}>((set) => ({
  promptTokens: undefined,
  completionTokens: undefined,
  updateAiTokens(promptTokens, completionTokens) {
    set(() => ({ promptTokens, completionTokens }));
  },
}));

export const AiUsageProvider: FC<AiUsage & { children: JSX.Element }> = ({
  promptTokensUsed,
  completionTokensUsed,
  children,
}) => {
  const { promptTokens, completionTokens, updateAiTokens } =
    persistentAiUsage();

  useEffect(() => {
    if (promptTokens == null && completionTokens == null) {
      updateAiTokens(promptTokensUsed, completionTokensUsed);
    }
  }, [
    completionTokens,
    completionTokensUsed,
    promptTokens,
    promptTokensUsed,
    updateAiTokens,
  ]);

  const updateUsage = useCallback(
    (usage: AiUsage) => {
      updateAiTokens(usage.promptTokensUsed, usage.completionTokensUsed);
    },
    [updateAiTokens]
  );

  return (
    <AiUsageContext.Provider
      value={{
        promptTokensUsed: promptTokens ?? 0,
        completionTokensUsed: completionTokens ?? 0,
        updateUsage,
      }}
    >
      {children}
    </AiUsageContext.Provider>
  );
};

export const useAiUsage = () => useContext(AiUsageContext);
