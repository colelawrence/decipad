import { css } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  p12Bold,
  p13Medium,
  p14Medium,
} from '../../primitives';
import { Magic } from '../../icons';
import { Tooltip } from '../../atoms';
import { isFlagEnabled } from '@decipad/feature-flags';

export const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 8px',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: 8,
});

const contentStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  marginLeft: 8,
});

const iconStyles = css({
  width: 16,
  height: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  svg: {
    width: 16,
    height: 16,
  },
});

export const titleStyles = css(p14Medium, {
  color: cssVar('textHeavy'),
  margin: 0,
  paddingTop: 2,
});

const labelStyles = css(p13Medium, {
  color: cssVar('textSubdued'),
  padding: '0px 6px',
  height: 24,
  paddingTop: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  marginLeft: 4,
  backgroundColor: cssVar('backgroundHeavy'),
  cursor: 'default',
});

export const buttonStyles = css(p14Medium, {
  height: 24,
  padding: '2px 8px 0px',
  borderRadius: 6,
  color: cssVar('textSubdued'),
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textDefault'),
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textHeavy'),
    boxShadow: `0px 0px 0px 2px ${cssVar('borderDefault')}`,
  },
});

const creditsStyles = css(p12Bold, {
  color: cssVar('textTitle'),
  backgroundColor: cssVar('backgroundHeavier'),
  padding: '0 4px',
  height: 16,
  marginLeft: 4,
  borderRadius: '4px',
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
}) => (
  <div css={wrapperStyles}>
    <div css={contentStyles}>
      <div css={iconStyles}>
        <Magic />
      </div>
      <p css={titleStyles}>Talk and build with AI</p>
      <Tooltip trigger={<span css={labelStyles}>Experimental</span>}>
        <span>
          This experimental version can make mistakes. Please provide feedback
          to help us improve.
        </span>
      </Tooltip>
      {isFlagEnabled('RESOURCE_USAGE_COUNT') && (
        <Tooltip
          trigger={
            <span css={labelStyles}>
              <span>Credits</span>
              <span css={creditsStyles}>{creditsUsed}</span>
            </span>
          }
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
