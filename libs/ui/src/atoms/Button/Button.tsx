import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import {
  black,
  cssVar,
  brand500,
  p13SemiBold,
  shortAnimationDuration,
  transparency,
  white,
  setCssVar,
  grey300,
} from '../../primitives';
import { Anchor, TextChildren } from '../../utils';

const styles = css(p13SemiBold, {
  flexGrow: 1,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '8px 14px',
  borderRadius: '6px',

  backgroundColor: brand500.rgb,
  color: black.rgb,
  boxShadow: `0 0 0 1px ${cssVar('backgroundColor')}`,

  transition: `box-shadow ${shortAnimationDuration} ease-out, background-color ${shortAnimationDuration} ease-out`,
  ':hover, :focus': {
    boxShadow: `0px 4px 8px ${transparency(black, 0.08).rgba}`,
  },
});

const primaryStyles = css({
  backgroundColor: black.rgb,
  color: white.rgb,
  boxShadow: `0 0 0 1px ${white.rgb}`,
});

const extraSlimStyles = css({
  padding: '6px 14px',
});

const extraLargeStyles = css({
  padding: '12px 24px',
});

const disabledStyles = css({
  backgroundColor: cssVar('strongHighlightColor'),
  ...setCssVar('currentTextColor', grey300.rgb),
});

type ButtonTypes =
  | {
      readonly href: string;
      readonly onClick?: undefined;
      readonly submit?: undefined;
    }
  | {
      readonly href?: undefined;
      readonly onClick?: () => void;
      readonly submit?: boolean;
    };

type ButtonProps = {
  readonly primary?: boolean;
  readonly children: TextChildren;
  readonly disabled?: boolean;
  readonly size?: 'extraSlim' | 'extraLarge';
} & ButtonTypes;

export const Button = ({
  primary = false,
  size,
  submit = primary,
  disabled = false,

  children,
  onClick = noop,
  href,
}: ButtonProps): ReturnType<React.FC> => {
  return href ? (
    <Anchor
      href={disabled ? '' : href}
      css={css([
        styles,
        primary && primaryStyles,
        size === 'extraSlim' && extraSlimStyles,
        size === 'extraLarge' && extraLargeStyles,
        disabled && disabledStyles,
      ])}
    >
      {children}
    </Anchor>
  ) : (
    <button
      disabled={disabled}
      type={submit ? 'submit' : 'button'}
      css={[
        styles,
        primary && primaryStyles,
        size === 'extraSlim' && extraSlimStyles,
        size === 'extraLarge' && extraLargeStyles,
        disabled && disabledStyles,
      ]}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
};
