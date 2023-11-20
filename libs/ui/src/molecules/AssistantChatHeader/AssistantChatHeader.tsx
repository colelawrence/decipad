import { css } from '@emotion/react';
import { cssVar, p14Medium } from '../../primitives';

export const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 12px',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: 12,
});

export const titleStyles = css(p14Medium, {
  color: cssVar('textHeavy'),
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
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textHeavy'),
  },
});

type AssistantChatHeaderProps = {
  onClear: () => void;
};

export const AssistantChatHeader: React.FC<AssistantChatHeaderProps> = ({
  onClear,
}) => (
  <div css={wrapperStyles}>
    <h1 css={titleStyles}>Talk and build with AI</h1>
    <button css={buttonStyles} onClick={onClear}>
      Clear chat
    </button>
  </div>
);
