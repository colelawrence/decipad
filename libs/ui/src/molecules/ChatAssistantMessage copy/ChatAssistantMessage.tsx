/* eslint decipad/css-prop-named-variable: 0 */

import { DeciAI, Duplicate, Feedback, ThumbsDown, ThumbsUp } from '../../icons';
import {
  componentCssVars,
  cssVar,
  p13Medium,
  p14Regular,
} from '../../primitives';

import { ChatMarkdownRenderer } from '../ChatMarkdownRenderer/ChatMarkdownRenderer';
import { css } from '@emotion/react';
import copyToClipboard from 'copy-to-clipboard';
import { Tooltip } from '../../atoms';
import { AssistantFeedbackPopUp } from '../AssistantFeedbackPopUp/AssistantFeedbackPopUp';
import { useCallback, useState } from 'react';
import { noop } from '@decipad/utils';
import { AssistantMessage } from '@decipad/react-contexts';

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
  gap: 4,
  gridTemplateRows: 'auto max-content',
});

const buttonContainerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0px 6px',
});

const buttonStyles = css(p13Medium, {
  height: 24,
  width: 24,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  cursor: 'pointer',

  '& > svg': {
    width: 16,
    height: 16,
  },

  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

const primaryButtonStyles = css(p13Medium, {
  height: 24,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0px 6px',
  backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
  color: componentCssVars('AIAssistantTextColor'),
  borderRadius: 6,
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: componentCssVars('AIAssistantBackgroundHoverColor'),
  },

  '&:active': {
    boxShadow: `0px 0px 0px 1px ${cssVar('borderDefault')}`,
  },
});

type Props = {
  readonly message: AssistantMessage;
  readonly isCurrentReply: boolean;
  readonly isGenerating: boolean;
  readonly regenerateResponse: () => void;
  readonly submitFeedback: (message: string) => void;
  readonly submitRating: (rating: 'like' | 'dislike') => void;
};

export const ChatAssistantMessage: React.FC<Props> = ({
  message,
  isCurrentReply,
  isGenerating,
  regenerateResponse,
  submitFeedback,
  submitRating,
}) => {
  const [hasRated, setHasRated] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  const handleSendRating = useCallback(
    (r: 'like' | 'dislike') => {
      submitRating(r);
      setHasRated(true);
    },
    [submitRating]
  );

  const handleSendFeedback = useCallback(
    (m: string) => {
      submitFeedback(m);
      setHasSubmittedFeedback(true);
    },
    [submitFeedback]
  );

  const { content } = message;

  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <DeciAI />
      </div>
      <div css={contentStyles}>
        <ChatMarkdownRenderer content={content} />
        {isCurrentReply && !isGenerating && (
          <div css={buttonContainerStyles}>
            <button css={primaryButtonStyles} onClick={regenerateResponse}>
              Retry
            </button>
            <div css={{ display: 'flex', gap: 4 }}>
              <Tooltip
                trigger={
                  <button
                    onClick={hasRated ? noop : () => handleSendRating('like')}
                    css={buttonStyles}
                    disabled={hasRated}
                    data-testid="like-button"
                  >
                    <ThumbsUp />
                  </button>
                }
              >
                This response is helpful
              </Tooltip>
              <Tooltip
                trigger={
                  <button
                    onClick={
                      hasRated ? noop : () => handleSendRating('dislike')
                    }
                    disabled={hasRated}
                    css={buttonStyles}
                    data-testid="copy-button"
                  >
                    <ThumbsDown />
                  </button>
                }
              >
                This response is not helpful
              </Tooltip>
              <AssistantFeedbackPopUp
                onSubmit={hasSubmittedFeedback ? noop : handleSendFeedback}
                trigger={
                  <button
                    css={buttonStyles}
                    disabled={hasSubmittedFeedback}
                    data-testid="feedback-button"
                  >
                    <Feedback />
                  </button>
                }
              />
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
        )}
      </div>
    </div>
  );
};
