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

const checkboxStyle = css({
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

const baseSwitchStyle = css({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  gap: '8px',
  alignItems: 'center',
  '> p': {
    ...p14Regular,
    flexGrow: '1',
    textAlign: 'left',
  },
  '> span': {
    backgroundColor: componentCssVars('ToggleOffBackgroundColor'),
    borderRadius: '100vmax',
    display: 'flex',
    flexShrink: 0,
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

const switchStyle = css(baseSwitchStyle, {
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

const smallSwitchStyle = css(baseSwitchStyle, {
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

type ToggleVariant = 'checkbox' | 'switch' | 'small-switch';

const toggleStyle = (variant: ToggleVariant) =>
  ({
    checkbox: checkboxStyle,
    switch: switchStyle,
    'small-switch': smallSwitchStyle,
  }[variant]);

export interface ToggleProps {
  active?: boolean | 'mixed';
  onChange?: (newActive: boolean) => void;
  ariaRoleDescription?: string;
  disabled?: boolean;
  label?: string;
  variant?: ToggleVariant;
  testId?: string;
}

export const Toggle: FC<ToggleProps> = ({
  variant = 'switch',
  ariaRoleDescription,
  active,
  onChange = noop,
  disabled = false,
  label,
}) => {
  return (
    <button
      aria-roledescription={ariaRoleDescription}
      css={toggleStyle(variant)}
      onClick={() => {
        /**
         * Clicking when the toggle is 'mixed' sets it to true, as per standard
         * browser behaviour for indeterminate checkboxes. Otherwise, toggle
         * between true and false. A toggle can't be set to 'mixed' by
         * clicking, so onChange only accepts true or false.
         */
        onChange(active !== true);
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
