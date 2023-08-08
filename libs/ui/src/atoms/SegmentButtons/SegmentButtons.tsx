import { noop } from '@decipad/utils';
import { FC, ReactNode } from 'react';
import { componentCssVars, cssVar } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { Tooltip } from '../Tooltip/Tooltip';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

interface SegmentButton {
  readonly children: ReactNode;
  readonly onClick: (event: React.MouseEvent<HTMLElement>) => void;
  readonly tooltip?: string | ReactNode;
  readonly testId?: string;
  readonly visible?: boolean;
  readonly disabled?: boolean;
  readonly selected?: boolean;
}

type SegmentButtonsProps = {
  readonly buttons: SegmentButton[];
  readonly variant?: 'transparent' | 'darker' | 'default';
  readonly border?: boolean;
  readonly hideDivider?: boolean;
  readonly padding?: 'default' | 'skinny';
  // If undefined, then you'll need to wrap the icons in some size;
  readonly iconSize?: 'table';
};

export const SegmentButtons: FC<SegmentButtonsProps> = ({
  buttons,
  variant = 'transparent',
  border = false,
  hideDivider = false,
  padding = 'default',
  iconSize,
}) => {
  return (
    <WrapperDiv variant={variant} border={border} hideDivider={hideDivider}>
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
          <FigureButton
            onClick={disabled ? noop : onClick}
            key={`figure-segment-${i}`}
            data-testid={`segment-button-trigger${testId ? `-${testId}` : ''}`}
            aria-disabled={disabled}
            variant={variant}
            selected={selected}
            padding={padding}
            iconSize={iconSize}
          >
            <div>{children}</div>
          </FigureButton>
        );

        return visible ? (
          hasTooltip && !disabled ? (
            <Tooltip
              side={variant === 'darker' ? 'bottom' : 'top'}
              key={`figure-segment-tooltip-${i}`}
              trigger={trigger}
            >
              {tooltip}
            </Tooltip>
          ) : (
            trigger
          )
        ) : (
          <div key={`figure-segment-invisible-${i}`} css={hiddenVis} />
        );
      })}
    </WrapperDiv>
  );
};

const WrapperDiv = styled.div<{
  variant: SegmentButtonsProps['variant'];
  border: SegmentButtonsProps['border'];
  hideDivider: SegmentButtonsProps['hideDivider'];
}>(
  (props) => ({
    display: 'flex',
    alignItems: 'center',

    // Interstingly, border radius isn't respected by children.
    // So you have to hide the overflow.
    borderRadius: '6px',
    overflow: 'hidden',
    ...(props.border && {
      border: `1px solid ${cssVar('borderDefault')}`,
    }),

    height: '100%',
    backgroundColor:
      props.variant === 'transparent'
        ? 'inherit'
        : componentCssVars('ButtonTertiaryDefaultBackground'),

    ...(props.hideDivider && {
      gap: '4px',
    }),

    figure: {
      ...(!props.hideDivider
        ? {
            ':not(:last-child)': {
              borderRight: `1px solid ${cssVar('borderDefault')}`,
            },
          }
        : {
            borderRadius: '6px',
          }),
    },
  }),
  hideOnPrint
);

const FigureButton = styled.figure<{
  variant: SegmentButtonsProps['variant'];
  padding: SegmentButtonsProps['padding'];
  iconSize: SegmentButtonsProps['iconSize'];
  selected: boolean;
}>((props) => ({
  display: 'grid',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: props.padding === 'default' ? '6px' : '4px',

  transition: 'background 0.1s ease-in-out',

  backgroundColor: props.selected
    ? componentCssVars('ButtonTertiaryAltDefaultBackground')
    : props.variant === 'transparent'
    ? 'transparent'
    : props.variant === 'darker'
    ? componentCssVars('ButtonTertiaryAltDefaultBackground')
    : cssVar('backgroundSubdued'),

  ':disabled': {
    cursor: 'not-allowed',
    backgroundColor: componentCssVars('ButtonTertiaryAltDisabledBackground'),
    color: componentCssVars('ButtonTertiaryAltDisabledText'),
  },

  ':not(:disabled)': {
    ':hover, :focus': {
      backgroundColor: componentCssVars('ButtonTertiaryAltHoverBackground'),
      color: componentCssVars('ButtonTertiaryAltHoverText'),
    },
  },

  ...(props.iconSize && {
    div: {
      width: props.iconSize === 'table' ? '13px' : '0px',
      height: props.iconSize === 'table' ? '13px' : '0px',
    },
  }),
}));

const hiddenVis = css({
  visibility: 'hidden',
});
