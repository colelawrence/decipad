/* eslint decipad/css-prop-named-variable: 0 */

import { css } from '@emotion/react';
import { cssVar, p13Medium } from '../../../primitives';
import { EventMessage, MessageStatus } from '@decipad/react-contexts';
import { Feedback, Refresh, Sparkles, Spinner, Warning } from '../../../icons';
import { Tooltip } from '../../../shared';
import { AssistantFeedbackPopUp } from '../AssistantFeedbackPopUp/AssistantFeedbackPopUp';
import { useCallback, useState } from 'react';
import { noop } from '@decipad/utils';

const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 2px',
  margin: '4px 0px',
  marginLeft: 32,
  gap: 4,
  borderRadius: 12,
});

const iconStyles = css({
  width: 20,
  height: 20,
  flexShrink: 0,
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  svg: {
    width: 16,
    height: 16,

    path: {
      stroke: cssVar('textSubdued'),
    },
  },
});

const contentStyles = css(p13Medium, {
  color: cssVar('textSubdued'),
  margin: 0,
  padding: 0,
  flex: 1,
});

const buttonContainerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  readonly message: EventMessage;
  readonly regenerateResponse: () => void;
  readonly submitFeedback: (message: string) => void;
  readonly isCurrentReply: boolean;
  readonly isGenerating: boolean;
  readonly container: HTMLElement | null;
};

const messageMeta = (status: MessageStatus) => {
  switch (status) {
    case 'pending':
      return {
        icon: <Spinner />,
      };
    case 'error':
      return {
        icon: <Warning />,
      };
    case 'success':
      return {
        icon: <Sparkles />,
      };
    default:
      return {
        icon: <Warning />,
      };
  }
};

export const ChatEventMessage: React.FC<Props> = ({
  message,
  isCurrentReply,
  isGenerating,
  regenerateResponse,
  submitFeedback,
  container,
}) => {
  const [hasReported, setHasReported] = useState(false);

  const { content, uiContent, status } = message;

  const handleSendFeedback = useCallback(
    (m: string) => {
      submitFeedback(m);
      setHasReported(true);
    },
    [submitFeedback]
  );

  return (
    <div css={wrapperStyles}>
      <div css={iconStyles}>{messageMeta(status).icon}</div>
      <p css={contentStyles}>{uiContent ?? content}</p>
      {isCurrentReply && !isGenerating && status === 'error' && (
        <div css={buttonContainerStyles}>
          <AssistantFeedbackPopUp
            onSubmit={hasReported ? noop : handleSendFeedback}
            container={container}
            trigger={
              <button
                css={buttonStyles}
                disabled={hasReported}
                data-testid="report-button"
              >
                <Feedback />
              </button>
            }
          />
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
  );
};
