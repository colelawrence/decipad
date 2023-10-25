/* eslint decipad/css-prop-named-variable: 0 */

import { Message } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import { ThumbsDown, ThumbsUp } from '../../icons';
import {
  componentCssVars,
  cssVar,
  p13Medium,
  p14Medium,
} from '../../primitives';
import {
  AssistantAIMessage,
  AssistantFeedbackPopUp,
  AssistantUserMessage,
} from '../../molecules';

const wrapperStyles = css(
  {
    position: 'relative',
    overflowX: 'hidden',
    width: 640,
    height: '100%',
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  deciOverflowYStyles
);

const listStyles = css({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 16px',
  width: 632,
});

const buttonContainerStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 20px',
  width: '100%',
});

const buttonStyles = css(p14Medium, {
  height: 28,
  padding: '1px 8px 0px',
  borderRadius: 4,
  backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
  color: componentCssVars('AIAssistantTextColor'),
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: componentCssVars('AIAssistantBackgroundHoverColor'),
    color: componentCssVars('AIAssistantTextColor'),
  },

  '&:active': {
    boxShadow: `0px 0px 0px 2px ${cssVar('backgroundDefault')}`,
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
});

const secondaryButtonStyles = css(p13Medium, {
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

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
});

type AssistantMessageListProps = {
  readonly messages: Message[];
  readonly isProcessing: boolean;
  readonly canRegenerateResponse: boolean;
  readonly canSubmitFeedback: boolean;
  readonly handleRegenerateResponse: () => void;
  readonly handleSendPositiveFeedback: (message: string) => void;
  readonly handleSendNegativeFeedback: (message: string) => void;
};

export const AssistantMessageList: React.FC<AssistantMessageListProps> = ({
  messages,
  isProcessing,
  canRegenerateResponse,
  canSubmitFeedback,
  handleRegenerateResponse,
  handleSendPositiveFeedback,
  handleSendNegativeFeedback,
}) => {
  return (
    <div css={wrapperStyles}>
      <div css={buttonContainerStyles}>
        <button
          onClick={handleRegenerateResponse}
          disabled={isProcessing || !canRegenerateResponse}
          css={buttonStyles}
        >
          Regenerate
        </button>
        {canSubmitFeedback && (
          <>
            <AssistantFeedbackPopUp
              onSubmit={handleSendPositiveFeedback}
              trigger={
                <button
                  css={secondaryButtonStyles}
                  disabled={isProcessing}
                  data-testid="like-button"
                >
                  <ThumbsUp />
                  <span>Like</span>
                </button>
              }
            />
            <AssistantFeedbackPopUp
              onSubmit={handleSendNegativeFeedback}
              trigger={
                <button
                  css={secondaryButtonStyles}
                  disabled={isProcessing}
                  data-testid="dislike-button"
                >
                  <ThumbsDown />
                  <span>Dislike</span>
                </button>
              }
            />
          </>
        )}
      </div>
      <div css={listStyles} data-testid="assistant-message-list">
        {messages.map((message) => {
          const { id, role, status } = message;

          if (role === 'user') {
            return (
              <AssistantUserMessage key={id} text={message.content || ''} />
            );
          }

          if (role === 'assistant' && 'content' in message) {
            return (
              <AssistantAIMessage
                key={id}
                status={status}
                text={message.content}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
