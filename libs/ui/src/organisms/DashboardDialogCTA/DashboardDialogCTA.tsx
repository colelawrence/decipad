/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Button } from '../../atoms';

import { h2, p14Regular } from '../../primitives';

const dashboardDialogCTAStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  alignItems: 'center',
});

interface DashboardDialogCTAProps {
  readonly icon: ReactNode;
  readonly primaryText: string;
  readonly primaryActionLabel?: string;
  readonly primaryAction?: () => void;
  readonly primaryActionHref?: string;
  readonly secondaryText?: string;
  readonly secondaryActionLabel?: string;
  readonly secondaryAction?: () => void;
  readonly secondaryActionHref?: string;
}

export const DashboardDialogCTA = ({
  icon,
  primaryText,
  primaryActionLabel,
  primaryAction,
  primaryActionHref,
  secondaryText,
  secondaryActionLabel,
  secondaryAction,
  secondaryActionHref,
}: DashboardDialogCTAProps): ReturnType<FC> => {
  return (
    <div css={dashboardDialogCTAStyles}>
      <span css={{ width: '40px', height: '40px' }}>{icon}</span>
      <h1 css={css(h2, { gridRow: 'heading' })}>{primaryText}</h1>
      {secondaryText && (
        <p
          css={css(p14Regular, {
            gridRow: 'text',
          })}
        >
          {secondaryText}
        </p>
      )}
      <div css={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {primaryAction && primaryActionLabel && (
          <div css={{ gridRow: 'button' }}>
            <Button
              type="primary"
              href={primaryActionHref}
              onClick={primaryAction}
            >
              {primaryActionLabel}
            </Button>
          </div>
        )}

        {secondaryAction && secondaryActionLabel && (
          <div css={{ gridRow: 'button' }}>
            <Button
              type="secondary"
              href={secondaryActionHref}
              onClick={secondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
