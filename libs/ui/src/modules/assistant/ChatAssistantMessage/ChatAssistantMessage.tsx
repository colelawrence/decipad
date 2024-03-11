/* eslint decipad/css-prop-named-variable: 0 */

import {
  DeciAI,
  Duplicate,
  Feedback,
  Refresh,
  ThumbsDown,
  ThumbsUp,
} from '../../../icons';
import {
  componentCssVars,
  cssVar,
  p13Medium,
  p14Regular,
} from '../../../primitives';

import { ClientEventsContext } from '@decipad/client-events';
import { AssistantMessage } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import copyToClipboard from 'copy-to-clipboard';
import { useCallback, useContext, useState } from 'react';
import { JellyBeans, Tooltip } from '../../../shared';
import { AssistantFeedbackPopUp } from '../AssistantFeedbackPopUp/AssistantFeedbackPopUp';
import { ChatMarkdownRenderer } from '../ChatMarkdownRenderer/ChatMarkdownRenderer';

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
  color: componentCssVars('AIAssistantTextColor'),

  '& svg': {
    width: 16,
    height: 16,
  },
});

const contentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '22px',
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
  padding: '0px 6px',
  gap: 4,
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

type Props = {
  readonly message: AssistantMessage;
  readonly isCurrentReply: boolean;
  readonly isGenerating: boolean;
  readonly sendMessage: (content: string) => void;
  readonly regenerateResponse: () => void;
  readonly submitFeedback: (message: string) => void;
  readonly submitRating: (rating: 'like' | 'dislike') => void;
  readonly container: HTMLDivElement | null;
};

export const ChatAssistantMessage: React.FC<Props> = ({
  message,
  isCurrentReply,
  isGenerating,
  regenerateResponse,
  sendMessage,
  submitFeedback,
  submitRating,
  container,
}) => {
  const [hasRated, setHasRated] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  const clientEvent = useContext(ClientEventsContext);

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

  const handleUseSuggestions = useCallback(
    (s: string) => {
      sendMessage(s);
      clientEvent({
        type: 'action',
        action: 'ai chat send message',
        props: {
          isSuggested: true,
        },
      });
    },
    [sendMessage, clientEvent]
  );

  const { content, suggestions } = message;

  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <DeciAI />
      </div>
      <div css={contentStyles}>
        <ChatMarkdownRenderer content={content} />
        {isCurrentReply && suggestions && suggestions.length > 0 && (
          <JellyBeans
            beans={suggestions.map((text) => {
              return {
                text,
                onClick: () => handleUseSuggestions(text),
              };
            })}
          />
        )}
        {isCurrentReply && !isGenerating && (
          <div css={buttonContainerStyles}>
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
                  onClick={hasRated ? noop : () => handleSendRating('dislike')}
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
              container={container}
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
            <Tooltip
              trigger={
                <button
                  onClick={regenerateResponse}
                  css={buttonStyles}
                  data-testid="regenerate-button"
                >
                  <Refresh />
                </button>
              }
            >
              Regenerate this response
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
