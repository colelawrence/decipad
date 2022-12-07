import { css, CSSObject } from '@emotion/react';
import { ReactNode } from 'react';
import {
  brand200,
  brand300,
  brand500,
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
import { useEventNoEffect } from '../../utils/useEventNoEffect';

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
      backgroundColor: cssVar('strongTextColor'),
      ...setCssVar('currentTextColor', cssVar('backgroundColor')),
      ':hover, :focus': {
        backgroundColor: cssVar('normalTextColor'),
      },
    },
    disabled: {
      backgroundColor: cssVar('weakTextColor'),
      ...setCssVar('currentTextColor', cssVar('backgroundColor')),
    },
  },
  primaryBrand: {
    enabled: {
      backgroundColor: brand500.rgb,
      ...setCssVar('currentTextColor', offBlack.rgb),
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
      backgroundColor: cssVar('strongHighlightColor'),
      ...setCssVar('currentTextColor', cssVar('strongTextColor')),
      ':hover, :focus': {
        backgroundColor: cssVar('highlightColor'),
      },
    },
    disabled: {
      backgroundColor: cssVar('strongHighlightColor'),
      ...setCssVar('currentTextColor', cssVar('weakerTextColor')),
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
  onClick,
  href,
}: ButtonProps): ReturnType<React.FC> => {
  const onButtonClick = useEventNoEffect(onClick);

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
