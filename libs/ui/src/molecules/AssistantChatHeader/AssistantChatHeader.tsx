import { isFlagEnabled } from '@decipad/feature-flags';
import { css } from '@emotion/react';
import { useState } from 'react';
import { Tooltip } from '../../atoms';
import {
  componentCssVars,
  cssVar,
  p12Bold,
  p13Medium,
  p14Medium,
} from '../../primitives';

export const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 12px',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: 12,
});

export const titleStyles = css(p14Medium, {
  color: cssVar('textHeavy'),
  margin: 0,
});

export const buttonStyles = css(p14Medium, {
  height: 24,
  padding: '2px 8px 0px',
  borderRadius: 6,
  color: cssVar('textSubdued'),
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
    color: cssVar('textHeavy'),
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textHeavy'),
  },
});

const labelWrapperStyles = css(p13Medium, {
  padding: '4px',
  backgroundColor: cssVar('backgroundHeavy'),
  borderRadius: '4px',
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
});

const creditsLabelStyles = css({
  color: cssVar('textDisabled'),
});

const creditsStyles = css({
  color: cssVar('textTitle'),
  backgroundColor: cssVar('backgroundHeavier'),
  padding: '0 4px',
  borderRadius: '4px',
});

const titleWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const tooltipTitleStyles = css(p12Bold, {
  color: componentCssVars('TooltipText'),
});

const tooltipTextStyles = css({
  color: componentCssVars('TooltipTextSecondary'),
});

type AssistantChatHeaderProps = {
  onClear: () => void;
  creditsUsed?: number;
  creditsQuotaLimit?: number;
  isPremium?: boolean;
};

export const AssistantChatHeader: React.FC<AssistantChatHeaderProps> = ({
  onClear,
  creditsUsed = 0,
  creditsQuotaLimit = 0,
  isPremium = false,
}) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const creditsLabel = (
    <div
      css={labelWrapperStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p css={creditsLabelStyles}>Credits</p>
      <p css={creditsStyles}>{creditsUsed}</p>
    </div>
  );

  return (
    <div css={wrapperStyles}>
      <div css={titleWrapperStyles}>
        <h1 css={titleStyles}>Talk and build with AI</h1>
        {isFlagEnabled('RESOURCE_USAGE_COUNT') && (
          <Tooltip
            trigger={creditsLabel}
            open={hovered}
            side="bottom"
            variant="small"
          >
            <div css={tooltipTitleStyles}>
              {creditsUsed}/{creditsQuotaLimit} used
            </div>
            {!isPremium && <p css={tooltipTextStyles}>Upgrade to earn more</p>}
          </Tooltip>
        )}
      </div>
      <button css={buttonStyles} onClick={onClear}>
        Clear chat
      </button>
    </div>
  );
};
