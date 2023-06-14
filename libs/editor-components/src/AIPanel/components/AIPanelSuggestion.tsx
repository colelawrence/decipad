import type { FC } from 'react';
import { Button, ErrorMessage, cssVar, p16Regular } from '@decipad/ui';
import { css } from '@emotion/react';
import { RemoteData } from '../hooks';

const completionCss = css({
  ...p16Regular,
  background: cssVar('highlightColor'),
  borderRadius: 5,
  marginBottom: 8,
  padding: 8,
});

const buttonContainerCss = css({
  display: 'flex',
  gridGap: 8,
  button: {
    flex: 'none',
    color: cssVar('aiInsertButtonColor'),
    background: cssVar('aiInsertButtonBgColor'),
    radius: 4,
  },
});

type AIPanelSuggestionProps = {
  completionRd: RemoteData<{ completion: string }>;
  makeUseOfSuggestion: (s: string) => void;
  regenerate?: () => void;
};

export const AIPanelSuggestion: FC<AIPanelSuggestionProps> = ({
  completionRd,
  makeUseOfSuggestion,
  regenerate,
}) => {
  switch (completionRd.status) {
    case 'success': {
      return (
        <div contentEditable={false}>
          <div css={completionCss}>{completionRd.result.completion}</div>
          <div css={buttonContainerCss}>
            <Button
              onClick={() => {
                makeUseOfSuggestion(completionRd.result.completion);
              }}
              size="extraExtraSlim"
            >
              Insert
            </Button>
            {regenerate && (
              <Button size="extraExtraSlim" onClick={regenerate}>
                Regenerate
              </Button>
            )}
          </div>
        </div>
      );
    }
    case 'error': {
      return <ErrorMessage error={completionRd.error} />;
    }
    case 'loading':
    case 'not asked': {
      return null;
    }
  }
};
