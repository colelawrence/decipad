/* eslint decipad/css-prop-named-variable: 0 */
import { useCanUseDom } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css, SerializedStyles } from '@emotion/react';
import {
  Arrow,
  Content,
  Portal,
  Root,
  Trigger,
} from '@radix-ui/react-hover-card';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { FC, MouseEventHandler, useCallback } from 'react';
import { componentCssVars, cssVar, p12Medium } from '../../primitives';
import { useIsDragging } from './useIsDragging';

const contentWrapperStyles = css({
  borderRadius: '6px',

  maxWidth: '300px',
  padding: '12px 16px',
  wordBreak: 'break-word',
  zIndex: '10000',

  backgroundColor: componentCssVars('TooltipBackground'),
});

const smallVariantStyles = (
  side: 'top' | 'right' | 'bottom' | 'left' | undefined
) =>
  css([
    {
      padding: '8px 12px',
    },
    side === 'left' && { marginLeft: '-1px' },
    side === 'top' && { marginTop: '-1px' },
    side === 'right' && { marginRight: '-1px' },
    side === 'bottom' && { marginBottom: '-1px' },
  ]);

const contentStyles = css(p12Medium, {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '4px',
  color: componentCssVars('TooltipText'),
});

const lightArrowStyles = css({
  polygon: {
    fill: cssVar('backgroundMain'),
    stroke: cssVar('borderDefault'),
  },

  borderColor: 'black',
});
const darkArrowStyles = css({
  fill: componentCssVars('TooltipBackground'),
});

const clickableStyles = css({
  cursor: 'pointer',
});

interface TooltipProps {
  readonly children?: React.ReactNode;
  readonly trigger?: React.ReactNode;

  readonly align?: 'start' | 'center' | 'end';

  readonly variant?: 'normal' | 'small';
  readonly side?: 'top' | 'right' | 'bottom' | 'left';
  readonly theme?: 'dark' | 'light';

  readonly hoverOnly?: boolean;
  readonly onClick?: MouseEventHandler<HTMLDivElement>;
  readonly stopClickPropagation?: boolean;

  readonly open?: boolean;
  readonly onChangeOpen?: (open: boolean) => void;

  readonly wrapperStyles?: SerializedStyles;

  readonly usePortal?: boolean;
}

export const Tooltip = ({
  children,
  trigger,
  open,
  onChangeOpen,
  hoverOnly = false,
  variant,
  onClick,
  stopClickPropagation = false,
  side,
  theme = 'dark',
  align,
  wrapperStyles = css(),
  usePortal = true,
}: TooltipProps): ReturnType<FC> => {
  const isDragging = useIsDragging();
  // eslint-disable-next-line no-param-reassign
  [open, onChangeOpen] = useControllableState({
    prop: open,
    onChange: onChangeOpen,
  });

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (stopClickPropagation) {
        e.stopPropagation();
      }
      onClick?.(e);
    },
    [onClick, stopClickPropagation]
  );

  const content = (
    <Content
      side={side}
      align={align}
      css={[
        contentWrapperStyles,
        variant === 'small' && smallVariantStyles(side),
        onClick && clickableStyles,
        wrapperStyles,
      ]}
      onClick={handleClick}
    >
      <Arrow
        css={theme === 'dark' ? darkArrowStyles : lightArrowStyles}
        width={18}
        height={9}
        offset={6}
      />
      <div css={contentStyles}>{children}</div>
    </Content>
  );

  return (
    <Root
      openDelay={100}
      closeDelay={100}
      open={open && !isDragging}
      onOpenChange={hoverOnly ? noop : onChangeOpen}
    >
      <Trigger
        onMouseMove={(e) => {
          if (e.buttons) {
            onChangeOpen?.(false);
          }
        }}
        onMouseOut={() => {
          if (hoverOnly) {
            onChangeOpen?.(false);
          }
        }}
        onMouseOver={() => {
          if (hoverOnly) {
            onChangeOpen?.(true);
          }
        }}
        asChild
      >
        {trigger}
      </Trigger>
      {useCanUseDom() && usePortal && <Portal>{content}</Portal>}
      {useCanUseDom() && !usePortal && content}
    </Root>
  );
};
