import { css, SerializedStyles } from '@emotion/react';
import {
  Arrow,
  Content,
  Root,
  Trigger,
  Portal,
} from '@radix-ui/react-hover-card';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { noop } from 'lodash';
import { FC } from 'react';
import {
  offBlack,
  cssVar,
  darkTheme,
  p12Medium,
  setCssVar,
  white,
} from '../../primitives';
import { useIsDragging } from './useIsDragging';

const contentWrapperStyles = css({
  background: offBlack.rgb,

  outline: `1px solid ${white.rgb}`,
  borderRadius: '6px',

  maxWidth: '300px',
  padding: '12px 16px',
  wordBreak: 'break-all',
  zIndex: '1000',
});

const smallVariantStyles = css({
  padding: '8px 12px',
});

const contentStyles = css(p12Medium, {
  ...darkTheme,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '4px',
});

const arrowStyles = css({
  fill: cssVar('strongTextColor'),
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
  readonly hoverOnly?: boolean;
  readonly onClick?: () => void;

  readonly open?: boolean;
  readonly onChangeOpen?: (open: boolean) => void;

  readonly wrapperStyles?: SerializedStyles;
}

export const Tooltip = ({
  children,
  trigger,
  open,
  onChangeOpen,
  hoverOnly,
  variant,
  onClick,
  side,
  align,
  wrapperStyles = css(),
}: TooltipProps): ReturnType<FC> => {
  const isDragging = useIsDragging();
  // eslint-disable-next-line no-param-reassign
  [open, onChangeOpen] = useControllableState({
    prop: open,
    onChange: onChangeOpen,
  });

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
      <Portal>
        <Content
          side={side}
          align={align}
          css={[
            contentWrapperStyles,
            variant === 'small' && smallVariantStyles,
            onClick && clickableStyles,
            wrapperStyles,
          ]}
          onClick={onClick}
        >
          <Arrow css={arrowStyles} width={18} height={9} offset={6} />
          <div css={contentStyles}>{children}</div>
        </Content>
      </Portal>
    </Root>
  );
};
