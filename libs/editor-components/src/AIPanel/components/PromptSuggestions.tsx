import { JellyBeans } from 'libs/ui/src/shared/atoms';
import { ReactNode, useCallback } from 'react';

export type PromptSuggestion = {
  icon?: ReactNode;
  name: string;
  prompt: string;
};

type PromptSuggestionsProps = {
  prompts: PromptSuggestion[];
  runPrompt: (prompt: string) => void;
  disabled: boolean;
};

export const PromptSuggestions = ({
  prompts,
  runPrompt,
  disabled,
}: PromptSuggestionsProps) => {
  const beanOnClick = useCallback(
    (prompt: string) => {
      runPrompt(prompt);
    },
    [runPrompt]
  );

  return (
    <JellyBeans
      beans={prompts.map(({ icon, name, prompt }) => ({
        icon,
        text: name,
        disabled,
        onClick: () => beanOnClick(prompt),
      }))}
    />
  );
};
