import { noop } from '@decipad/utils';
import { FC, ReactNode } from 'react';
import { componentCssVars } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { Tooltip } from '../Tooltip/Tooltip';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

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
  readonly variant?: 'transparent' | 'darker';
};

export const SegmentButtons: FC<SegmentButtonsProps> = ({
  buttons,
  variant = 'transparent',
}) => {
  return (
    <WrapperDiv variant={variant}>
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
          >
            {children}
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

const WrapperDiv = styled.div<{ variant: SegmentButtonsProps['variant'] }>(
  (props) => ({
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    backgroundColor:
      props.variant === 'transparent'
        ? 'inherit'
        : componentCssVars('ButtonTertiaryDefaultBackground'),
  }),
  hideOnPrint
);

const FigureButton = styled.figure<{
  variant: SegmentButtonsProps['variant'];
  selected: boolean;
}>((props) => ({
  display: 'grid',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  minHeight: '30px',
  minWidth: '30px',

  svg: {
    width: '16px',
    height: '16px',
  },

  transition: 'background 0.1s ease-in-out',

  backgroundColor: props.selected
    ? props.variant === 'transparent'
      ? componentCssVars('ButtonTertiaryDefaultBackground')
      : componentCssVars('ButtonTertiaryAltDefaultBackground')
    : 'inherit',

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
}));

const hiddenVis = css({
  visibility: 'hidden',
});
