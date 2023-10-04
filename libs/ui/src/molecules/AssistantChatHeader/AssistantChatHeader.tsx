import { p12Medium, p14Regular } from '@decipad/ui';
import { css } from '@emotion/react';
import { componentCssVars } from '../../primitives';

export const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0px 20px',
  width: '100%',
  height: 44,
  backgroundColor: componentCssVars('AIAssistantElevationColor'),
});

export const titleStyles = css(p14Regular, {
  margin: 0,
  color: componentCssVars('AIAssistantTextColor'),
});

export const buttonStyles = css(p12Medium, {
  height: 24,
  padding: '1px 8px 0px',
  borderRadius: 6,
  border: `1px solid ${componentCssVars('AIAssistantTextSubduedColor')}`,
  backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
  color: componentCssVars('AIAssistantTextSubduedColor'),
  cursor: 'pointer',

  '&:hover': {
    borderColor: componentCssVars('AIAssistantTextColor'),
    color: componentCssVars('AIAssistantTextColor'),
    zIndex: 1,
  },

  '&:active': {
    borderColor: componentCssVars('AIAssistantHighlightColor'),
    color: componentCssVars('AIAssistantHighlightColor'),
  },
});

type AssistantChatHeaderProps = {
  onClear: () => void;
};

export const AssistantChatHeader: React.FC<AssistantChatHeaderProps> = ({
  onClear,
}) => (
  <div css={wrapperStyles}>
    <h1 css={titleStyles}>AI Assistant</h1>
    <button css={buttonStyles} onClick={onClear}>
      Clear
    </button>
  </div>
);
