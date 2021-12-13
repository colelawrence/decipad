import { css } from '@emotion/react';
import { Arrow, Content, Root, Trigger } from '@radix-ui/react-hover-card';
import { FC } from 'react';
import {
  black,
  cssVar,
  darkTheme,
  p12Medium,
  setCssVar,
  white,
} from '../../primitives';

const contentWrapperStyles = css({
  background: black.rgb,

  outline: `1px solid ${white.rgb}`,
  borderRadius: '6px',

  maxWidth: '300px',
  padding: '12px 16px',
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
}

export const Tooltip = ({
  children,
  trigger,
}: TooltipProps): ReturnType<FC> => {
  return (
    <Root openDelay={100} closeDelay={100}>
      <Trigger asChild>{trigger}</Trigger>
      <Content css={contentWrapperStyles}>
        <Arrow css={arrowStyles} width={18} height={9} offset={6} />
        <div css={contentStyles}>{children}</div>
      </Content>
    </Root>
  );
};
