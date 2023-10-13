/* eslint decipad/css-prop-named-variable: 0 */
import { Tooltip, p14Regular } from '@decipad/ui';
import { DeciAI, Duplicate, ThumbsDown, ThumbsUp } from '../../icons';
import { componentCssVars, cssVar, p14Medium } from '../../primitives';

import { AIResponseRating, AIResponseType } from '@decipad/react-contexts';
import { AssistantMessageMarkdown } from '../AssistantMessageMarkdown/AssistantMessageMarkdown';
import { css } from '@emotion/react';
import copyToClipboard from 'copy-to-clipboard';

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
});

const iconButtonStyles = css(p14Medium, {
  height: 24,
  width: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
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

type AssistantAIMessageProps = {
  readonly text: string;
  readonly type: AIResponseType;
  readonly rating?: AIResponseRating;
  readonly canRegenerate?: boolean;
  readonly handleLikeResponse: () => void;
  readonly handleDislikeResponse: () => void;
  readonly handleRegenerateResponse: () => void;
};

export const AssistantAIMessage: React.FC<AssistantAIMessageProps> = ({
  text,
  type,
  rating,
  canRegenerate,
  handleLikeResponse,
  handleDislikeResponse,
  handleRegenerateResponse,
}) => {
  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <DeciAI />
      </div>
      <div css={contentStyles}>
        {type === 'pending' && <div css={loadingContentStyles}>{text}</div>}
        {type === 'error' && <div css={errorContentStyles}>{text}</div>}
        {type === 'success' && <AssistantMessageMarkdown text={text} />}
        {type !== 'pending' && (
          <div css={buttonContainerStyles}>
            {canRegenerate && (
              <button onClick={handleRegenerateResponse} css={buttonStyles}>
                Regenerate
              </button>
            )}
            <Tooltip
              trigger={
                <button
                  onClick={handleLikeResponse}
                  css={iconButtonStyles}
                  data-selected={rating === 'like'}
                  data-testid="like-button"
                >
                  <ThumbsUp />
                </button>
              }
            >
              Like response
            </Tooltip>
            <Tooltip
              trigger={
                <button
                  onClick={handleDislikeResponse}
                  css={iconButtonStyles}
                  data-selected={rating === 'dislike'}
                  data-testid="dislike-button"
                >
                  <ThumbsDown />
                </button>
              }
            >
              Dislike response
            </Tooltip>
            {type !== 'error' && (
              <Tooltip
                trigger={
                  <button
                    onClick={() => copyToClipboard(text)}
                    css={iconButtonStyles}
                    data-selected={rating === 'dislike'}
                    data-testid="copy-button"
                  >
                    <Duplicate />
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
