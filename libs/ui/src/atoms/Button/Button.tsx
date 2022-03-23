import { noop } from '@decipad/utils';
import { css, CSSObject } from '@emotion/react';
import {
  black,
  brand500,
  p13SemiBold,
  transparency,
  white,
  setCssVar,
  red200,
  grey700,
  grey600,
  grey400,
  brand300,
  brand200,
  red500,
  grey200,
  grey100,
  red400,
} from '../../primitives';
import { Anchor, TextChildren } from '../../utils';

const styles = css(p13SemiBold, {
  flexGrow: 1,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '6px',
  boxShadow: `0px 1px 12px -4px ${transparency(grey700, 0.04).rgba}`,
});

const typeStyles: Record<
  NonNullable<ButtonProps['type']>,
  { enabled: CSSObject; disabled: CSSObject }
> = {
  primary: {
    enabled: {
      backgroundColor: black.rgb,
      ...setCssVar('currentTextColor', white.rgb),
      ':hover, :focus': {
        backgroundColor: grey600.rgb,
      },
    },
    disabled: {
      backgroundColor: grey400.rgb,
      ...setCssVar('currentTextColor', white.rgb),
    },
  },
  primaryBrand: {
    enabled: {
      backgroundColor: brand500.rgb,
      ...setCssVar('currentTextColor', black.rgb),
      ':hover, :focus': {
        backgroundColor: brand300.rgb,
      },
    },
    disabled: {
      backgroundColor: brand200.rgb,
      ...setCssVar('currentTextColor', grey400.rgb),
    },
  },
  secondary: {
    enabled: {
      backgroundColor: grey200.rgb,
      ...setCssVar('currentTextColor', black.rgb),
      ':hover, :focus': {
        backgroundColor: grey100.rgb,
      },
    },
    disabled: {
      backgroundColor: grey200.rgb,
      ...setCssVar('currentTextColor', grey400.rgb),
    },
  },
  danger: {
    enabled: {
      backgroundColor: red500.rgb,
      ...setCssVar('currentTextColor', white.rgb),
      ':hover, :focus': {
        backgroundColor: red400.rgb,
      },
    },
    disabled: {
      backgroundColor: red200.rgb,
      ...setCssVar('currentTextColor', white.rgb),
    },
  },
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, CSSObject> = {
  normal: {
    padding: '8px 14px',
  },
  extraSlim: {
    padding: '6px 14px',
  },
  extraLarge: {
    padding: '12px 24px',
  },
};

const enabledStyles = css({ cursor: 'pointer' });
const disabledStyles = css({ cursor: 'unset' });

type ButtonProps = {
  readonly type?: 'primary' | 'primaryBrand' | 'secondary' | 'danger';
  readonly children: TextChildren;
  readonly disabled?: boolean;
  readonly size?: 'normal' | 'extraSlim' | 'extraLarge';

  readonly href?: string;
  readonly onClick?: () => void;
  readonly submit?: boolean;
};

export const Button = ({
  type = 'secondary',
  size = 'normal',
  submit = type === 'primary' || type === 'primaryBrand',
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
        typeStyles[type][disabled ? 'disabled' : 'enabled'],
        sizeStyles[size],
        disabled ? disabledStyles : enabledStyles,
      ])}
      onClick={onClick}
    >
      {children}
    </Anchor>
  ) : (
    <button
      disabled={disabled}
      type={submit ? 'submit' : 'button'}
      css={css([
        styles,
        typeStyles[type][disabled ? 'disabled' : 'enabled'],
        sizeStyles[size],
        disabled ? disabledStyles : enabledStyles,
      ])}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
