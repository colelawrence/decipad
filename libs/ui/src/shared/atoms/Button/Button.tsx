/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css, CSSObject, SerializedStyles } from '@emotion/react';
import { forwardRef, ReactNode } from 'react';
import {
  cssVar,
  grey700,
  orange800,
  red800,
  transparency,
  yellow100,
  yellow200,
  yellow300,
  yellow400,
  yellow500,
  componentCssVars,
  p13Bold,
} from '../../../primitives';
import { Anchor, useCancelingEvent } from '../../../utils';

const styles = css(p13Bold, {
  flexGrow: 1,
  lineHeight: '1rem',
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
      backgroundColor: cssVar('backgroundMain'),

      ':hover, :focus': {
        backgroundColor: cssVar('backgroundSubdued'),
      },
    },
    disabled: {
      border: 0,
      borderRadius: 0,
      boxShadow: '',
      backgroundColor: cssVar('backgroundMain'),
    },
  },
  primaryBrand: {
    enabled: {
      backgroundColor: componentCssVars('ButtonPrimaryDefaultBackground'),
      color: componentCssVars('ButtonPrimaryDefaultText'),

      ':hover, :focus': {
        backgroundColor: componentCssVars('ButtonPrimaryHoverBackground'),
        color: componentCssVars('ButtonPrimaryHoverText'),
      },
    },
    disabled: {
      backgroundColor: componentCssVars('ButtonPrimaryDisabledBackground'),
      color: componentCssVars('ButtonPrimaryDisabledText'),
    },
  },
  primary: {
    enabled: {
      backgroundColor: componentCssVars('ButtonSecondaryDefaultBackground'),
      color: componentCssVars('ButtonSecondaryDefaultText'),

      ':hover, :focus': {
        backgroundColor: componentCssVars('ButtonSecondaryHoverBackground'),
        color: componentCssVars('ButtonSecondaryHoverText'),
      },
    },
    disabled: {
      backgroundColor: componentCssVars('ButtonSecondaryDisabledBackground'),
      color: componentCssVars('ButtonSecondaryDisabledText'),
    },
  },
  secondary: {
    enabled: {
      backgroundColor: componentCssVars('ButtonTertiaryDefaultBackground'),
      color: componentCssVars('ButtonTertiaryDefaultText'),

      ':hover, :focus': {
        backgroundColor: componentCssVars('ButtonTertiaryHoverBackground'),
        color: componentCssVars('ButtonTertiaryHoverText'),
      },
    },
    disabled: {
      backgroundColor: componentCssVars('ButtonTertiaryDisabledBackground'),
      color: componentCssVars('ButtonTertiaryDisabledText'),
    },
  },
  tertiaryAlt: {
    enabled: {
      backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
      color: componentCssVars('ButtonTertiaryAltDefaultText'),

      ':hover, :focus': {
        backgroundColor: componentCssVars('ButtonTertiaryAltHoverBackground'),
        color: componentCssVars('ButtonTertiaryAltHoverText'),
      },
    },
    disabled: {
      backgroundColor: componentCssVars('ButtonTertiaryAltDisabledBackground'),
      color: componentCssVars('ButtonTertiaryAltDisabledText'),
    },
  },
  danger: {
    enabled: {
      backgroundColor: componentCssVars('ButtonDangerDefaultBackground'),
      color: componentCssVars('ButtonDangerDefaultText'),

      ':hover, :focus': {
        backgroundColor: componentCssVars('ButtonDangerHoverBackground'),
        color: componentCssVars('ButtonDangerHoverText'),
      },
    },
    disabled: {
      backgroundColor: componentCssVars('ButtonDangerDisabledBackground'),
      color: componentCssVars('ButtonDangerDisabledText'),
    },
  },
  yellow: {
    enabled: {
      backgroundColor: yellow500.rgb,

      ':hover, :focus': {
        backgroundColor: yellow400.rgb,
      },
    },
    disabled: {
      backgroundColor: yellow200.rgb,
    },
  },
  lightYellow: {
    enabled: {
      backgroundColor: yellow100.rgb,

      ':hover, :focus': {
        backgroundColor: yellow300.rgb,
      },
    },
    disabled: {
      backgroundColor: 'transparent',
    },
  },
  text: {
    enabled: {},
    disabled: {},
  },
  darkDanger: {
    enabled: {
      backgroundColor: red800.rgb,
    },
    disabled: {},
  },
  darkWarning: {
    enabled: {
      backgroundColor: orange800.rgb,
    },
    disabled: {},
  },
  darkWarningText: {
    enabled: {},
    disabled: {},
  },
  tagBrand: {
    enabled: {
      backgroundColor: componentCssVars('ButtonPrimaryDefaultBackground'),
      color: componentCssVars('ButtonPrimaryDefaultText'),
      borderRadius: 4,
      textTransform: 'uppercase',
      lineHeight: 1,
    },
    disabled: {},
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
    padding: '4px 8px 4px 8px',
  },
  tag: {
    padding: '2px 4px',
  },
};

const enabledStyles = css({ cursor: 'pointer' });
const disabledStyles = css({ cursor: 'not-allowed' });

type ButtonProps = {
  readonly type?:
    | 'minimal'
    | 'primary'
    | 'primaryBrand'
    | 'secondary'
    | 'tertiaryAlt'
    | 'danger'
    | 'yellow'
    | 'lightYellow'
    | 'text'
    | 'tagBrand'
    | 'darkDanger'
    | 'darkWarning'
    | 'darkWarningText';
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly size?:
    | 'normal'
    | 'extraSlim'
    | 'extraLarge'
    | 'extraExtraSlim'
    | 'tag';
  readonly testId?: string;
  readonly href?: string;
  readonly tabIndex?: number;
  readonly autoFocus?: boolean;
  readonly onClick?: () => void;
  readonly submit?: boolean;
  readonly styles?: SerializedStyles | Parameters<typeof css>[0];
  readonly sameTab?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
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
    },
    ref
  ) => {
    const onButtonClick = useCancelingEvent(onClick);

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
        data-testid={testId}
      >
        {children}
      </Anchor>
    ) : (
      <button
        ref={ref}
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
  }
);
