/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Check } from '../../../icons';
import {
  componentCssVars,
  cssVar,
  p14Regular,
  shortAnimationDuration,
} from '../../../primitives';

const CheckSVGString = encodeURIComponent(
  renderToStaticMarkup(<Check color={cssVar('iconColorMain')} />)
);

const CheckSVGStringDataURI = `url("data:image/svg+xml,${CheckSVGString}")`;

const makeCheckbox = css({
  '> span': {
    backgroundColor: cssVar('backgroundSubdued'),
    border: `1px solid ${cssVar('borderDefault')}`,
    width: '16px',
    height: '16px',
    display: 'flex',
    borderRadius: '4px',
    alignItems: 'center',
    position: 'relative',
    backgroundRepeat: 'no-repeat',
    '&[aria-checked="true"]': {
      backgroundColor: cssVar('iconColorHeavy'),
      borderColor: cssVar('iconColorHeavy'),
    },
    '&[aria-disabled="true"]': {
      backgroundColor: cssVar('backgroundDefault'),
      borderColor: cssVar('borderDefault'),
    },
    '> span': {
      width: '14px',
      height: '14px',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      backgroundRepeat: 'no-repeat',
      '&[aria-checked="true"]': {
        background: CheckSVGStringDataURI,
      },
    },
  },
});

const makeToggle = css({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  '> p': {
    ...p14Regular,
    flexGrow: '1',
    textAlign: 'left',
  },
  '> span': {
    backgroundColor: componentCssVars('ToggleOffBackgroundColor'),
    borderRadius: '100vmax',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    transition: `background-color ${shortAnimationDuration} ease-in-out`,
    position: 'relative',
    '&[aria-checked="true"]': {
      backgroundColor: componentCssVars('ToggleOnBackgroundColor'),
    },
    '&[aria-disabled="true"]': {
      backgroundColor: cssVar('backgroundMain'),
    },
    '> span': {
      borderRadius: '100vmax',
      position: 'absolute',
      left: '2px',
      transition: `left ${shortAnimationDuration} ease-out`,
      backgroundColor: cssVar('backgroundMain'),
      '&[aria-checked="true"]': {
        backgroundColor: cssVar('backgroundMain'),
        left: `calc(100% - 20px)`,
      },
    },
  },
});

const makeNormalToggle = css(makeToggle, {
  '> span': {
    width: '46px',
    height: '24px',
    '> span': {
      width: '18px',
      height: '18px',
      '&[aria-checked="true"]': {
        left: `calc(100% - 20px)`,
      },
    },
  },
});

const makeSmallToggle = css(makeToggle, {
  '> span': {
    width: '34px',
    height: '18px',
    '> span': {
      width: '14px',
      height: '14px',
      '&[aria-checked="true"]': {
        left: `calc(100% - 16px)`,
      },
    },
  },
});

export interface ToggleProps {
  active?: boolean;
  onChange?: (newActive: boolean) => void;
  ariaRoleDescription?: string;
  disabled?: boolean;
  label?: string;
  variant?: 'checkbox' | 'toggle' | 'small-toggle';
  testId?: string;
}

const CheckboxToggle: FC<Omit<ToggleProps, 'variant'>> = ({
  ariaRoleDescription,
  active,
  onChange = noop,
  disabled = false,
  label,
}) => {
  return (
    <button
      aria-roledescription={ariaRoleDescription}
      css={makeCheckbox}
      onClick={() => {
        onChange(!active);
      }}
      disabled={disabled}
      aria-checked={active}
      data-testid="toggle-cell-editor"
    >
      {label && <p>{label}</p>}
      <span aria-checked={active}>
        <span role="checkbox" aria-checked={active} />
      </span>
    </button>
  );
};

const NormalToggle: FC<ToggleProps> = ({
  ariaRoleDescription,
  active,
  onChange = noop,
  disabled = false,
  label,
}) => {
  return (
    <button
      aria-roledescription={ariaRoleDescription}
      css={makeNormalToggle}
      onClick={() => {
        onChange(!active);
      }}
      disabled={disabled}
      aria-checked={active}
      data-testid="toggle-cell-editor"
    >
      {label && <p>{label}</p>}
      <span aria-checked={active}>
        <span role="checkbox" aria-checked={active} />
      </span>
    </button>
  );
};

const SmallToggle: FC<ToggleProps> = ({
  ariaRoleDescription,
  active,
  onChange = noop,
  disabled = false,
  label,
}) => {
  return (
    <button
      aria-roledescription={ariaRoleDescription}
      css={makeSmallToggle}
      onClick={() => {
        onChange(!active);
      }}
      disabled={disabled}
      aria-checked={active}
      data-testid="toggle-cell-editor"
    >
      {label && <p>{label}</p>}
      <span aria-checked={active}>
        <span role="checkbox" aria-checked={active} />
      </span>
    </button>
  );
};

/**
 * Multipurpose component.
 *
 * props `variant` can be used to return different styles
 * of checkbox with differing styles.
 *
 */
export const Toggle = (props: ToggleProps): ReturnType<FC> => {
  const variant: NonNullable<ToggleProps['variant']> =
    props.variant ?? 'toggle';

  if (variant === 'toggle') {
    return <NormalToggle {...props} />;
  }

  if (variant === 'small-toggle') {
    return <SmallToggle {...props} />;
  }

  if (variant === 'checkbox') {
    return <CheckboxToggle {...props} />;
  }

  throw new Error('Impossible branch');
};
