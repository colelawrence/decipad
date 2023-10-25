/* eslint decipad/css-prop-named-variable: 0 */

import { DeciAI, Duplicate } from '../../icons';
import {
  componentCssVars,
  cssVar,
  p13Medium,
  p14Regular,
} from '../../primitives';

import { AIResponseStatus } from '@decipad/react-contexts';
import { AssistantMessageMarkdown } from '../AssistantMessageMarkdown/AssistantMessageMarkdown';
import { css } from '@emotion/react';
import copyToClipboard from 'copy-to-clipboard';
import { Tooltip } from '../../atoms';

const wrapperStyles = css({
  display: 'flex',
  padding: '8px 0px',
  width: '100%',
  gap: 8,
});

const avatarStyles = css({
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '2px 0px',
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: componentCssVars('AIAssistantBackgroundColor'),

  '& svg': {
    width: 16,
    height: 16,

    '& path': {
      fill: componentCssVars('AIAssistantTextColor'),
    },
  },
});

const contentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '20px',
  padding: '2px 0px',
  color: cssVar('textHeavy'),
  borderRadius: 8,

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -40,
    width: 40,
    height: '100%',
  },
});

const errorContentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '20px',
  padding: '6px 12px',
  borderRadius: 8,
  backgroundColor: cssVar('stateDangerBackground'),
  color: cssVar('stateDangerText'),
});

const loadingContentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '20px',
  padding: '6px',
  borderRadius: 8,
  color: cssVar('textSubdued'),
});

const buttonContainerStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px',
  width: '100%',
});

const tinyButtonStyles = css(p13Medium, {
  height: 24,
  width: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  padding: '0px 8px 0px 6px',
  borderRadius: 4,
  cursor: 'pointer',

  span: {
    marginTop: 2,
  },

  '& > svg': {
    width: 14,
    height: 14,
  },

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

type AssistantAIMessageProps = {
  readonly text: string;
  readonly status: AIResponseStatus;
};

export const AssistantAIMessage: React.FC<AssistantAIMessageProps> = ({
  text,
  status,
}) => {
  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <DeciAI />
      </div>
      <div css={contentStyles}>
        {status === 'pending' && <div css={loadingContentStyles}>{text}</div>}
        {status === 'error' && <div css={errorContentStyles}>{text}</div>}
        {status === 'success' && <AssistantMessageMarkdown text={text} />}
        {status !== 'pending' && (
          <div css={buttonContainerStyles}>
            {status !== 'error' && (
              <Tooltip
                trigger={
                  <button
                    onClick={() => copyToClipboard(text)}
                    css={tinyButtonStyles}
                    data-testid="copy-button"
                  >
                    <Duplicate />
                    <span>Copy</span>
                  </button>
                }
              >
                Copy response to clipboard
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
