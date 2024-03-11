import { JellyBeans } from 'libs/ui/src/shared';
import { ReactNode, useCallback } from 'react';

export type AiParaOp = 'replace' | 'below';

export type PromptSuggestion = {
  icon?: ReactNode;
  name: string;
  prompt: string;
  primary: AiParaOp;
};

type PromptSuggestionsProps = {
  prompts: PromptSuggestion[];
  runPrompt: (prompt: PromptSuggestion) => void;
  disabled: boolean;
};

export const PromptSuggestions = ({
  prompts,
  runPrompt,
  disabled,
}: PromptSuggestionsProps) => {
  const beanOnClick = useCallback(
    (prompt: PromptSuggestion) => {
      runPrompt(prompt);
    },
    [runPrompt]
  );

  return (
    <JellyBeans
      beans={prompts.map((props) => {
        const { icon, name } = props;
        return {
          icon,
          text: name,
          disabled,
          onClick: () => beanOnClick(props),
        };
      })}
    />
  );
};
