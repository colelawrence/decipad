/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  p12Bold,
  p12Medium,
  p13Medium,
} from '../../primitives';
import { Magic, Trash } from '../../icons';
import { Button, Tooltip } from '../../atoms';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useCallback } from 'react';
import { useAiCreditsStore } from '@decipad/react-contexts';

export const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const headingStyles = css(p13Medium, {
  height: 32,
  display: 'flex',
  alignItems: 'center',
  padding: '4px 8px 4px 10px',
  gap: 4,
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: 8,
  color: cssVar('textHeavy'),
});

const iconStyles = css({
  width: 16,
  height: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  svg: {
    width: 14,
    height: 14,

    path: {
      fill: cssVar('textHeavy'),
      stroke: cssVar('textHeavy'),
    },
  },
});

export const titleStyles = css(p13Medium, {
  color: cssVar('textHeavy'),
  margin: 0,
  paddingTop: 2,
  marginRight: 4,
});

const tagStyles = css(p13Medium, {
  color: cssVar('textSubdued'),
  height: 32,
  padding: '2px 8px',
  margin: '-4px -8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  marginLeft: 4,
  backgroundColor: cssVar('backgroundDefault'),
  boxShadow: `0 0 0 2px ${cssVar('backgroundMain')}`,
  cursor: 'default',
  transition: 'background-position 0.3s ease-in-out',
});

export const buttonStyles = css(p13Medium, {
  height: 32,
  width: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  color: cssVar('textSubdued'),
  backgroundColor: cssVar('backgroundDefault'),
  cursor: 'pointer',

  '& > svg': {
    width: 18,
    height: 18,
  },

  '&:hover': {
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textDefault'),

    '& > svg > path': {
      stroke: cssVar('textDefault'),
    },
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavier'),
    color: cssVar('textHeavy'),
  },
});

const tooltipTitleStyles = css(p12Bold, {
  color: componentCssVars('TooltipText'),
});

const tooltipTextStyles = css({
  color: componentCssVars('TooltipTextSecondary'),
});

const creditsStyles = (noCreditsLeft: boolean) =>
  css(tagStyles, {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    label: {
      ...p12Bold,
      backgroundColor: noCreditsLeft
        ? componentCssVars('ErrorBlockError')
        : cssVar('backgroundHeavier'),
      display: 'flex',
      height: '16px',
      padding: '10px 4px',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '4px',
    },
  });

const addMoreCreditsButton = css(p12Medium, {
  borderRadius: '4px',
  padding: '2px 4px',
  backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
  color: componentCssVars('ButtonTertiaryAltDefaultText'),
  display: 'inline',
});

const Credits: React.FC<{
  creditsUsed: number;
  creditsQuota: number;
}> = ({ creditsUsed, creditsQuota }) => {
  const { setIsBuyCreditsModalOpen } = useAiCreditsStore();
  const creditsLeft = Math.max(0, creditsQuota - creditsUsed);
  return (
    <Tooltip
      trigger={
        <div css={creditsStyles(creditsLeft === 0)}>
          <span>Credits</span>
          <label>
            <span>{Math.max(0, creditsLeft)}</span>
          </label>
          {isFlagEnabled('AI_BUY_MORE_CREDITS') && (
            <Button
              type="secondary"
              styles={addMoreCreditsButton}
              onClick={() => setIsBuyCreditsModalOpen(true)}
            >
              Buy more
            </Button>
          )}
        </div>
      }
      side="bottom"
      variant="small"
    >
      <div css={tooltipTitleStyles}>
        {Math.min(creditsQuota, creditsUsed)}/{creditsQuota} used
      </div>
    </Tooltip>
  );
};

type AssistantChatHeaderProps = {
  onClear: () => void;
  creditsUsed: number;
  creditsQuotaLimit: number;
  onStop: () => void;
  isGenerating: boolean;
};

export const AssistantChatHeader: React.FC<AssistantChatHeaderProps> = ({
  onClear,
  creditsUsed,
  creditsQuotaLimit,
  onStop,
  isGenerating,
}) => {
  const handleStop = useCallback(() => {
    onClear();
    if (isGenerating) {
      onStop();
    }
  }, [isGenerating, onClear, onStop]);

  return (
    <div css={wrapperStyles}>
      <div css={headingStyles}>
        <div css={iconStyles}>
          <Magic />
        </div>
        <p css={titleStyles}>Talk and build with AI</p>
        <Tooltip
          trigger={
            <span css={tagStyles}>
              <span css={{ paddingTop: 1 }}>Experimental</span>
            </span>
          }
          side="bottom"
          variant="small"
        >
          <p css={tooltipTextStyles}>
            Please, keep in mind that this experimental version can make
            mistakes. Please provide feedback to help us improve.
          </p>
        </Tooltip>
      </div>
      <div css={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {isFlagEnabled('RESOURCE_USAGE_COUNT') && (
          <Credits creditsUsed={creditsUsed} creditsQuota={creditsQuotaLimit} />
        )}
        <Tooltip
          trigger={
            <button
              css={buttonStyles}
              onClick={handleStop}
              data-testid="ai-chat-clear"
            >
              <Trash />
            </button>
          }
          side="bottom"
          variant="small"
        >
          <span>Clear all chat history</span>
        </Tooltip>
      </div>
    </div>
  );
};
