import { cssVar } from '@decipad/ui';
import { css } from '@emotion/react';
import { ReactNode } from 'react';

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

const buttonCss = css({
  display: 'flex',
  gridGap: 5.5,
  background: cssVar('highlightColor'),
  padding: '6px 12px 6px 9px',
  borderRadius: 6,
  fontSize: 12,
  '&:hover': {
    background: cssVar('strongHighlightColor'),
  },
  svg: {
    width: 13,
    height: 13,
  },
});

const containerCss = css({
  display: 'flex',
  alignItems: 'start',
  gridGap: 8,
  marginBottom: 8,
  button: {},
});

export const PromptSuggestions = ({
  prompts,
  runPrompt,
  disabled,
}: PromptSuggestionsProps) => {
  return (
    <div css={containerCss} contentEditable={false}>
      {prompts.map(({ icon, name, prompt }) => {
        return (
          <button
            css={buttonCss}
            disabled={disabled}
            onClick={() => runPrompt(prompt)}
            type="button"
          >
            {icon || null}
            {name}
          </button>
        );
      })}
    </div>
  );
};
