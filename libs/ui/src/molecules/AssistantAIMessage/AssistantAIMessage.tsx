/* eslint decipad/css-prop-named-variable: 0 */
import { Tooltip, p12Medium, p13Regular, p14Regular } from '@decipad/ui';
import { AlignArrowLeft, Sparkles } from '../../icons';
import { componentCssVars, cssVar } from '../../primitives';

import { AIResponseRating } from '@decipad/react-contexts';
import { AssistantMessageMarkdown } from '../AssistantMessageMarkdown/AssistantMessageMarkdown';
import { css } from '@emotion/react';

const wrapperStyles = css({
  display: 'flex',
  padding: '8px 20px',
  width: '100%',
  gap: 6,
});

const avatarStyles = css({
  width: 28,
  height: 28,
  margin: '8px 0px 2px',
  padding: 4,
  borderRadius: '50%',
  backgroundColor: componentCssVars('AIAssistantHighlightColor'),
  flexShrink: 0,

  '& svg': {
    width: 20,
    height: 20,

    '& path': {
      stroke: componentCssVars('AIAssistantTextColor'),
    },
  },
});

const contentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '20px',
  padding: '6px',
  borderRadius: 8,
  color: componentCssVars('AIAssistantTextColor'),

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -48,
    width: 48,
    height: '100%',
  },

  '&:hover': {
    boxShadow: `0px 0px 0px 2px ${componentCssVars(
      'AIAssistantHighlightColor'
    )}`,

    '& button': {
      visibility: 'visible',
    },
  },
});

const errorContentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '20px',
  padding: '6px',
  borderRadius: 8,
  color: cssVar('stateDangerBackground'),
});

const buttonContainerStyles = css({
  display: 'flex',
  gap: 6,
  padding: '6px',
  width: '100%',
});

const buttonGroupStyles = css({
  display: 'flex',

  '& button': {
    margin: '0px -1px',

    '&:first-of-type': {
      borderRadius: '6px 0px 0px 6px',
    },
    '&:last-of-type': {
      borderRadius: '0px 6px 6px 0px',
    },
  },
});

const buttonStyles = css(p12Medium, {
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

  '&[data-selected="true"]': {
    backgroundColor: componentCssVars('AIAssistantElevationColor'),
  },
});

const insertButtonStyles = css({
  width: 28,
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: -28,
  height: 28,
  borderRadius: '6px 0px 0px 6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: componentCssVars('AIAssistantHighlightColor'),
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  color: componentCssVars('AIAssistantTextColor'),
  visibility: 'hidden',

  '& svg': {
    width: 20,
    height: 20,

    '& path': {
      stroke: componentCssVars('AIAssistantTextColor'),
    },
  },
});

const tooltipTextStyles = css(p13Regular, {
  margin: 0,
  color: componentCssVars('AIAssistantTextColor'),
  textAlign: 'center',
});

type AssistantAIMessageProps = {
  readonly text: string | null;
  readonly rating?: AIResponseRating;
  readonly handleLikeResponse: () => void;
  readonly handleDislikeResponse: () => void;
  readonly handleRegenerateResponse: () => void;
  readonly handleSuggestChanges: () => void;
};

export const AssistantAIMessage: React.FC<AssistantAIMessageProps> = ({
  text,
  rating,
  handleLikeResponse,
  handleDislikeResponse,
  handleRegenerateResponse,
  handleSuggestChanges,
}) => {
  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <Sparkles />
      </div>
      <div css={contentStyles}>
        {text ? (
          <AssistantMessageMarkdown text={text || ''} />
        ) : (
          <p css={errorContentStyles}>There was an error processing request</p>
        )}
        <div css={buttonContainerStyles}>
          <div css={buttonGroupStyles}>
            <button
              onClick={handleLikeResponse}
              css={buttonStyles}
              data-selected={rating === 'like'}
              data-testid="like-button"
            >
              Like
            </button>
            <button
              onClick={handleDislikeResponse}
              css={buttonStyles}
              data-selected={rating === 'dislike'}
              data-testid="dislike-button"
            >
              Dislike
            </button>
          </div>
          <button onClick={handleRegenerateResponse} css={buttonStyles}>
            Regenerate Response
          </button>
        </div>

        <Tooltip
          trigger={
            <button onClick={handleSuggestChanges} css={insertButtonStyles}>
              <AlignArrowLeft />
            </button>
          }
        >
          <p css={tooltipTextStyles}>
            Insert this calculation to the notebook and creates all necessary
            items
          </p>
        </Tooltip>
      </div>
    </div>
  );
};
