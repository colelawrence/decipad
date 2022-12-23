import { noop } from '@decipad/utils';
import { css, CSSObject } from '@emotion/react';
import { MouseEvent, ReactNode, useCallback } from 'react';
import {
  cssVar,
  grey400,
  grey700,
  offBlack,
  orange300,
  orange800,
  p13Bold,
  red200,
  red400,
  red500,
  red800,
  setCssVar,
  transparency,
  white,
} from '../../primitives';
import { Anchor } from '../../utils';

const styles = css(p13Bold, {
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
      backgroundColor: cssVar('buttonPrimaryBackground'),
      ...setCssVar('currentTextColor', cssVar('buttonPrimaryText')),
      ':hover, :focus': {
        backgroundColor: cssVar('buttonPrimaryHover'),
      },
    },
    disabled: {
      backgroundColor: cssVar('buttonPrimaryDisabledBackground'),
      ...setCssVar('currentTextColor', cssVar('buttonPrimaryDisabledText')),
    },
  },
  primaryBrand: {
    enabled: {
      backgroundColor: cssVar('buttonBrandBackground'),
      ...setCssVar('currentTextColor', cssVar('buttonBrandText')),
      ':hover, :focus': {
        backgroundColor: cssVar('buttonBrandHover'),
      },
    },
    disabled: {
      backgroundColor: cssVar('buttonBrandDisabledBackground'),
      ...setCssVar('currentTextColor', cssVar('buttonBrandDisabledText')),
    },
  },
  secondary: {
    enabled: {
      backgroundColor: cssVar('buttonSecondaryBackground'),
      ...setCssVar('currentTextColor', cssVar('buttonSecondaryText')),
      ':hover, :focus': {
        backgroundColor: cssVar('buttonSecondaryHover'),
      },
    },
    disabled: {
      backgroundColor: cssVar('buttonSecondaryDisabledBackground'),
      ...setCssVar('currentTextColor', cssVar('buttonSecondaryDisabledText')),
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
  text: {
    enabled: {
      ...setCssVar('currentTextColor', offBlack.rgb),
    },
    disabled: {
      ...setCssVar('currentTextColor', grey400.rgb),
    },
  },
  darkDanger: {
    enabled: {
      backgroundColor: red800.rgb,
      ...setCssVar('currentTextColor', white.rgb),
    },
    disabled: {
      ...setCssVar('currentTextColor', grey400.rgb),
    },
  },
  darkWarning: {
    enabled: {
      backgroundColor: orange800.rgb,
      ...setCssVar('currentTextColor', white.rgb),
    },
    disabled: {
      ...setCssVar('currentTextColor', grey400.rgb),
    },
  },
  darkWarningText: {
    enabled: {
      ...setCssVar('currentTextColor', orange800.rgb),
    },
    disabled: {
      ...setCssVar('currentTextColor', orange300.rgb),
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
  readonly type?:
    | 'primary'
    | 'primaryBrand'
    | 'secondary'
    | 'danger'
    | 'text'
    | 'darkDanger'
    | 'darkWarning'
    | 'darkWarningText';
  readonly children: ReactNode;
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
  const onButtonClick = useCallback(
    (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      onClick();
    },
    [onClick]
  );

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
      onClick={submit ? onClick : onButtonClick}
    >
      {children}
    </button>
  );
};
