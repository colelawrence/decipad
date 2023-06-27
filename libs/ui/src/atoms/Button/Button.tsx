/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css, CSSObject, SerializedStyles } from '@emotion/react';
import { MouseEvent, ReactNode, useCallback } from 'react';
import {
  cssVar,
  grey400,
  grey700,
  offBlack,
  orange300,
  orange700,
  orange800,
  p13Bold,
  red200,
  red400,
  red500,
  red800,
  setCssVar,
  transparency,
  white,
  yellow100,
  yellow200,
  yellow300,
  yellow400,
  yellow500,
  yellow900,
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
  minimal: {
    enabled: {
      border: 0,
      borderRadius: 0,
      boxShadow: '',
      backgroundColor: cssVar('backgroundColor'),
      ...setCssVar('currentTextColor', cssVar('normalTextColor')),
      ':hover, :focus': {
        backgroundColor: cssVar('tintedBackgroundColor'),
      },
    },
    disabled: {
      border: 0,
      borderRadius: 0,
      boxShadow: '',
      backgroundColor: cssVar('backgroundColor'),
      ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    },
  },
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
  yellow: {
    enabled: {
      backgroundColor: yellow500.rgb,
      ...setCssVar('currentTextColor', yellow900.rgb),
      ':hover, :focus': {
        backgroundColor: yellow400.rgb,
      },
    },
    disabled: {
      backgroundColor: yellow200.rgb,
      ...setCssVar('currentTextColor', yellow900.rgb),
    },
  },
  lightYellow: {
    enabled: {
      backgroundColor: yellow100.rgb,
      ...setCssVar('currentTextColor', orange700.rgb),
      ':hover, :focus': {
        backgroundColor: yellow300.rgb,
      },
    },
    disabled: {
      backgroundColor: 'transparent',
      ...setCssVar('currentTextColor', orange700.rgb),
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
  extraExtraSlim: {
    padding: '4px 10px 4px 8px',
  },
};

const enabledStyles = css({ cursor: 'pointer' });
const disabledStyles = css({ cursor: 'unset' });

type ButtonProps = {
  readonly type?:
    | 'minimal'
    | 'primary'
    | 'primaryBrand'
    | 'secondary'
    | 'danger'
    | 'yellow'
    | 'lightYellow'
    | 'text'
    | 'darkDanger'
    | 'darkWarning'
    | 'darkWarningText';
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly size?: 'normal' | 'extraSlim' | 'extraLarge' | 'extraExtraSlim';
  readonly testId?: string;
  readonly href?: string;
  readonly tabIndex?: number;
  readonly autoFocus?: boolean;
  readonly onClick?: () => void;
  readonly submit?: boolean;
  readonly styles?: SerializedStyles;
  readonly sameTab?: boolean;
};

export const Button = ({
  type = 'secondary',
  size = 'normal',
  submit = type === 'primary' || type === 'primaryBrand',
  disabled = false,
  autoFocus,
  testId = '',
  tabIndex,
  children,
  onClick = noop,
  href,
  styles: extraStyles,
  sameTab,
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
        extraStyles,
      ])}
      onClick={onClick}
      sameTab={sameTab}
    >
      {children}
    </Anchor>
  ) : (
    <button
      autoFocus={autoFocus}
      disabled={disabled}
      type={submit ? 'submit' : 'button'}
      css={css([
        styles,
        typeStyles[type][disabled ? 'disabled' : 'enabled'],
        sizeStyles[size],
        disabled ? disabledStyles : enabledStyles,
        extraStyles,
      ])}
      tabIndex={tabIndex}
      onClick={submit ? onClick : onButtonClick}
      data-testid={testId}
    >
      {children}
    </button>
  );
};
