import { Button, ErrorMessage, cssVar, p16Regular } from '@decipad/ui';
import { css } from '@emotion/react';
import { Refresh } from 'libs/ui/src/icons';
import type { FC } from 'react';
import { ParagraphAIPanelProps } from '../ParagraphAIPanel';
import { RemoteData } from '../hooks';
import { PromptSuggestion } from './PromptSuggestions';

const completionCss = css(p16Regular, {
  background: cssVar('backgroundDefault'),
  borderRadius: 5,
  marginBottom: 8,
  padding: 8,
});

const buttonContainerCss = css({
  display: 'flex',
  gridGap: 8,
  button: {
    flex: 'none',
  },
});

type AIPanelSuggestionProps = {
  completionRd: RemoteData<{ completion: string }>;
  makeUseOfSuggestion: ParagraphAIPanelProps['updateParagraph'];
  regenerate?: () => void;
  prompt: PromptSuggestion;
};

export const AIPanelSuggestion: FC<AIPanelSuggestionProps> = ({
  completionRd,
  makeUseOfSuggestion,
  regenerate,
  prompt,
}) => {
  const getBtns = (completion: string) => {
    switch (prompt.primary) {
      case 'replace':
        return (
          <>
            <Button
              onClick={() => {
                makeUseOfSuggestion(completion, 'replace');
              }}
              size="extraExtraSlim"
              type="primary"
            >
              Replace paragraph
            </Button>
            <Button
              onClick={() => {
                makeUseOfSuggestion(completion, 'below');
              }}
              size="extraExtraSlim"
              type="secondary"
            >
              Insert below
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button
              onClick={() => {
                makeUseOfSuggestion(completion, 'below');
              }}
              size="extraExtraSlim"
              type="primary"
            >
              Insert below
            </Button>
            <Button
              onClick={() => {
                makeUseOfSuggestion(completion, 'replace');
              }}
              size="extraExtraSlim"
              type="secondary"
            >
              Replace paragraph
            </Button>
          </>
        );
    }
  };

  switch (completionRd.status) {
    case 'success': {
      return (
        <div contentEditable={false}>
          <div css={completionCss}>{completionRd.result.completion}</div>
          <div css={buttonContainerCss}>
            {getBtns(completionRd.result.completion)}
            {regenerate && (
              <div
                css={{ svg: { width: 16, height: 16 }, button: { padding: 4 } }}
              >
                <Button size="extraExtraSlim" onClick={regenerate}>
                  <Refresh />
                </Button>
              </div>
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
