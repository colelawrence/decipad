/* eslint decipad/css-prop-named-variable: 0 */

import { DeciAI, Duplicate } from '../../icons';
import {
  componentCssVars,
  cssVar,
  p13Medium,
  p14Regular,
} from '../../primitives';

import { AssistantMessage } from '@decipad/react-contexts';
import { ChatMarkdownRenderer } from '../ChatMarkdownRenderer/ChatMarkdownRenderer';
import { css } from '@emotion/react';
import copyToClipboard from 'copy-to-clipboard';
import { Tooltip } from '../../atoms';

const wrapperStyles = css({
  display: 'flex',
  padding: '8px 0px',
  gap: 4,
});

const avatarStyles = css({
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '4px 0px',
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
  borderRadius: 12,
  display: 'grid',
  gridTemplateColumns: 'auto 40px',
});

const buttonStyles = css(p13Medium, {
  height: 24,
  width: 24,
  margin: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  cursor: 'pointer',

  '& > svg': {
    width: 16,
    height: 16,
  },

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

type Props = {
  readonly message: AssistantMessage;
};

export const ChatAssistantMessage: React.FC<Props> = ({ message }) => {
  const { content } = message;
  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <DeciAI />
      </div>
      <div css={contentStyles}>
        <ChatMarkdownRenderer content={content} />

        <Tooltip
          trigger={
            <button
              onClick={() => copyToClipboard(content || '')}
              css={buttonStyles}
              data-testid="copy-button"
            >
              <Duplicate />
            </button>
          }
        >
          Copy response to clipboard
        </Tooltip>
      </div>
    </div>
  );
};
