import { css } from '@emotion/react';
import { componentCssVars, cssVar, p14Medium } from '../../primitives';

export const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0px 20px',
  width: '100%',
  height: 56,
  borderBottom: `1px solid ${cssVar('borderDefault')}`,
});

export const titleStyles = css(p14Medium, {
  margin: 0,
});

export const buttonStyles = css(p14Medium, {
  height: 24,
  padding: '2px 8px 0px',
  borderRadius: 6,
  color: cssVar('textSubdued'),
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
    color: cssVar('textHeavy'),
  },

  '&:active': {
    backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
    color: componentCssVars('AIAssistantTextColor'),
  },
});

type AssistantChatHeaderProps = {
  onClear: () => void;
};

export const AssistantChatHeader: React.FC<AssistantChatHeaderProps> = ({
  onClear,
}) => (
  <div css={wrapperStyles}>
    <h1 css={titleStyles}>Chat with AI assistant</h1>
    <button css={buttonStyles} onClick={onClear}>
      Clear chat
    </button>
  </div>
);
