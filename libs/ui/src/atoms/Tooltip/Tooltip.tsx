import { css } from '@emotion/react';
import { Arrow, Content, Root, Trigger } from '@radix-ui/react-hover-card';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { FC } from 'react';
import {
  offBlack,
  cssVar,
  darkTheme,
  p12Medium,
  setCssVar,
  white,
} from '../../primitives';

const contentWrapperStyles = css({
  background: offBlack.rgb,

  outline: `1px solid ${white.rgb}`,
  borderRadius: '6px',

  maxWidth: '300px',
  padding: '12px 16px',
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

interface TooltipProps {
  readonly children?: React.ReactNode;
  readonly trigger?: React.ReactNode;

  readonly variant?: 'normal' | 'small';

  readonly open?: boolean;
  readonly onChangeOpen?: (open: boolean) => void;
}

export const Tooltip = ({
  children,
  trigger,
  open,
  onChangeOpen,
  variant,
}: TooltipProps): ReturnType<FC> => {
  // eslint-disable-next-line no-param-reassign
  [open, onChangeOpen] = useControllableState({
    prop: open,
    onChange: onChangeOpen,
  });

  return (
    <Root
      openDelay={100}
      closeDelay={100}
      open={open}
      onOpenChange={onChangeOpen}
    >
      <Trigger
        onMouseMove={(e) => {
          if (e.buttons) {
            onChangeOpen?.(false);
          }
        }}
        asChild
      >
        {trigger}
      </Trigger>
      <Content
        css={[contentWrapperStyles, variant === 'small' && smallVariantStyles]}
      >
        <Arrow css={arrowStyles} width={18} height={9} offset={6} />
        <div css={contentStyles}>{children}</div>
      </Content>
    </Root>
  );
};
