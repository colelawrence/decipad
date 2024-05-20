import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FC, ReactNode } from 'react';
import { componentCssVars, cssVar } from '../../../primitives';
import { hideOnPrint } from '../../../styles/editor-layout';
import { Tooltip } from '../Tooltip/Tooltip';
import { ExperimentalTooltip } from '../ExperimentalTooltip/ExperimentalTooltip';

export interface SegmentButton {
  readonly children: ReactNode;
  readonly onClick: (event: React.MouseEvent<HTMLElement>) => void;
  readonly tooltip?: string | ReactNode;
  readonly experimentalTooltip?: boolean;
  readonly testId?: string;
  readonly visible?: boolean;
  readonly disabled?: boolean;
  readonly selected?: boolean;
}

export type SegmentButtonsProps = {
  readonly buttons: SegmentButton[];
  readonly variant?: 'transparent' | 'darker' | 'default' | 'lighter';
  readonly border?: boolean;
  readonly hideDivider?: boolean;
  readonly padding?: 'default' | 'skinny';
  // If undefined, then you'll need to wrap the icons in some size;
  readonly iconSize?: 'table' | 'integrations';
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
          experimentalTooltip = false,
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
            experimentalTooltip ? (
              <ExperimentalTooltip
                title={typeof tooltip === 'string' ? tooltip : ''}
                trigger={trigger}
                side="top"
              />
            ) : (
              <Tooltip
                side={variant === 'darker' ? 'bottom' : 'top'}
                key={`figure-segment-tooltip-${i}`}
                trigger={trigger}
              >
                {tooltip}
              </Tooltip>
            )
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

    backgroundColor:
      props.variant === 'transparent'
        ? 'inherit'
        : props.variant === 'lighter'
        ? componentCssVars('ButtonSecondaryDefaultBackground')
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
  padding: props.padding === 'default' ? '5px' : '4px',

  backgroundColor: props.selected
    ? componentCssVars('ButtonTertiaryAltDefaultBackground')
    : props.variant === 'transparent'
    ? 'transparent'
    : props.variant === 'darker'
    ? componentCssVars('ButtonTertiaryAltDefaultBackground')
    : props.variant === 'lighter'
    ? componentCssVars('ButtonTertiaryDefaultBackground')
    : cssVar('backgroundSubdued'),

  ':disabled': {
    cursor: 'not-allowed',
    backgroundColor: componentCssVars('ButtonTertiaryAltDisabledBackground'),
    color: componentCssVars('ButtonTertiaryAltDisabledText'),
  },
  ':not(:disabled)': {
    ':hover, :focus': {
      backgroundColor:
        props.variant !== 'lighter'
          ? componentCssVars('ButtonTertiaryAltHoverBackground')
          : componentCssVars('ButtonTertiaryHoverBackground'),
      color: componentCssVars('ButtonTertiaryAltHoverText'),
    },
  },

  ...(props.iconSize && {
    div: {
      width:
        props.iconSize === 'table'
          ? '13px'
          : props.iconSize === 'integrations'
          ? '16px'
          : '0px',
      height:
        props.iconSize === 'table'
          ? '13px'
          : props.iconSize === 'integrations'
          ? '16px'
          : '0px',
    },
  }),
}));

const hiddenVis = css({
  visibility: 'hidden',
});
