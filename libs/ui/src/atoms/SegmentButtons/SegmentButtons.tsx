/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, setCssVar } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { Tooltip } from '../Tooltip/Tooltip';

interface SegmentButton {
  readonly children: ReactNode;
  readonly onClick: (event: React.MouseEvent<HTMLElement>) => void;
  readonly tooltip?: string;
  readonly testId?: string;
  readonly visible?: boolean;
  readonly disabled?: boolean;
}

interface SegmentButtonsProps {
  readonly buttons: SegmentButton[];
}

export const SegmentButtons: FC<SegmentButtonsProps> = ({ buttons }) => {
  // visible is undefined by default, so !== false is the right
  // thing to do.
  const visibleButtons = buttons.filter((btn) => btn.visible !== false);
  return (
    <div
      css={[
        segmentButtonsStyles,
        visibleButtons.length > 1 && {
          '& figure:last-of-type': {
            borderLeft: `1px solid ${cssVar('borderHighlightColor')}`,
          },
        },
      ]}
    >
      {buttons.map((button, i) => {
        const {
          children,
          onClick,
          tooltip,
          testId,
          visible = true,
          disabled = false,
        } = button;
        const hasTooltip = !!tooltip;
        const trigger = (
          <figure
            role="button"
            onClick={disabled ? noop : onClick}
            key={`figure-segment-${i}`}
            data-testid={`segment-button-trigger${testId ? `-${testId}` : ''}`}
            css={disabled ? segmentDisabledButtonStyle : segmentButtonStyle}
          >
            {children}
          </figure>
        );
        return visible ? (
          hasTooltip && !disabled ? (
            <Tooltip
              side="top"
              key={`figure-segment-tooltip-${i}`}
              trigger={trigger}
            >
              {tooltip}
            </Tooltip>
          ) : (
            trigger
          )
        ) : (
          <div
            key={`figure-segment-invisible-${i}`}
            css={{ visibility: 'hidden' }}
          />
        );
      })}
    </div>
  );
};

const segmentButtonsStyles = css(hideOnPrint, {
  display: 'flex',
  alignItems: 'center',
  borderRadius: '6px',
  padding: 1,
  border: `1px solid ${cssVar('borderColor')}`,
  backgroundColor: cssVar('tintedBackgroundColor'),
  '& svg': {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    margin: '4px',
    width: '16px',
    height: '16px',
  },
});

const segmentButtonStyle = css({
  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
    borderRadius: 4,
  },
});

const segmentDisabledButtonStyle = css({
  cursor: 'not-allowed',
  '& svg': { ...setCssVar('currentTextColor', cssVar('strongHighlightColor')) },
});
