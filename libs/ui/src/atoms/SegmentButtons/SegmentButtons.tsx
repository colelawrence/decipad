/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, setCssVar, smallScreenQuery } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { Tooltip } from '../Tooltip/Tooltip';

interface SegmentButton {
  readonly children: ReactNode;
  readonly onClick: (event: React.MouseEvent<HTMLElement>) => void;
  readonly tooltip?: string;
  readonly testId?: string;
  readonly visible?: boolean;
  readonly disabled?: boolean;
  readonly selected?: boolean;
}

type SegmentButtonsProps = {
  readonly buttons: SegmentButton[];
  readonly variant?: 'default' | 'editor-sidebar' | 'topbar';
};

export const SegmentButtons: FC<SegmentButtonsProps> = ({
  buttons,
  variant = 'default',
}) => {
  const lastBorder = variant === 'default';
  const side = variant === 'editor-sidebar' ? 'bottom' : 'top';
  const selectedColor =
    variant === 'topbar' ? 'strongerHighlightColor' : 'highlightColor';
  // visible is undefined by default, so !== false is the right
  // thing to do.
  const visibleButtons = buttons.filter((btn) => btn.visible !== false);
  return (
    <div
      css={[
        segmentButtonsStyles,
        variant === 'topbar' && { gap: 6 },
        visibleButtons.length > 1 &&
          lastBorder && {
            '& figure:last-of-type': {
              borderLeft: `1px solid ${cssVar('borderHighlightColor')}`,
            },
          },
        variant === 'editor-sidebar' && {
          backgroundColor: 'transparent',
          border: 0,
          svg: { margin: 0, height: 20, width: 20 },
        },
        variant === 'topbar' && {
          backgroundColor: 'transparent',
          border: 0,
          figure: {
            height: 30,
            width: 30,
          },
          svg: {
            height: 16,
            width: 16,
            margin: 'auto',
            marginTop: 6,
          },
          [smallScreenQuery]: {
            display: 'none',
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
          selected = false,
        } = button;

        const hasTooltip = !!tooltip;
        const trigger = (
          <figure
            role="button"
            onClick={disabled ? noop : onClick}
            key={`figure-segment-${i}`}
            data-testid={`segment-button-trigger${testId ? `-${testId}` : ''}`}
            css={[
              disabled ? segmentDisabledButtonStyle : segmentButtonStyle,
              variant === 'editor-sidebar' && {
                borderRadius: 6,
                ':hover, :focus': {
                  backgroundColor: 'initial',
                  color: cssVar('strongTextColor'),
                },
              },
              variant === 'topbar' && {
                borderRadius: 4,
                ':hover, :focus': {
                  filter: 'brightness(95%)',
                },
              },
              selected && {
                backgroundColor: cssVar(selectedColor),
                ':hover, :focus': {
                  backgroundColor: cssVar(selectedColor),
                },
              },
            ]}
          >
            {children}
          </figure>
        );
        return visible ? (
          hasTooltip && !disabled ? (
            <Tooltip
              side={side}
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
    margin: '4px',
    width: '16px',
    height: '16px',
  },
});

const segmentButtonStyle = css({
  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
  },
});

const segmentDisabledButtonStyle = css({
  cursor: 'not-allowed',
  '& svg': { ...setCssVar('currentTextColor', cssVar('strongHighlightColor')) },
});
