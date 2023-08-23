/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BooleanCheckboxSelected,
  BooleanCheckboxUnselected,
} from '../../icons';
import {
  componentCssVars,
  cssVar,
  shortAnimationDuration,
} from '../../primitives';

// Skinny = true means the toggle will be in a table.
// Therefore needs to be smaller
const toggleStyles = (skinny: boolean) => (skinny ? makeCheckbox : makeToggle);

const BooleanCheckboxSelectedsvgString = encodeURIComponent(
  renderToStaticMarkup(<BooleanCheckboxSelected />)
);

const BooleanCheckboxSelectedsvgStringdataUri = `url("data:image/svg+xml,${BooleanCheckboxSelectedsvgString}")`;

const BooleanCheckboxUnselectedsvgString = encodeURIComponent(
  renderToStaticMarkup(<BooleanCheckboxUnselected />)
);
const BooleanCheckboxUnselectedsvgStringdataUri = `url("data:image/svg+xml,${BooleanCheckboxUnselectedsvgString}")`;

const makeCheckbox = css({
  background: BooleanCheckboxUnselectedsvgStringdataUri,
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  backgroundRepeat: 'no-repeat',
});

const makeToggle = css({
  backgroundColor: componentCssVars('ToggleOffBackgroundColor'),
  width: '46px',
  height: '24px',
  borderRadius: '100vmax',
  display: 'flex',
  alignItems: 'center',
  padding: '2px',
  transition: `background-color ${shortAnimationDuration} ease-in-out`,
  position: 'relative',
  '&[aria-checked="true"]': {
    backgroundColor: componentCssVars('ToggleOnBackgroundColor'),
  },
});

const disabledSwitchBgStyles = css({
  backgroundColor: cssVar('backgroundMain'),
});

const activeCheckboxBgStyles = css({
  background: BooleanCheckboxUnselectedsvgStringdataUri,
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
});

const toggleSwitchStyles = css({
  width: '18px',
  height: '18px',
  borderRadius: '100vmax',
  position: 'absolute',
  left: '2px',
  transition: `left ${shortAnimationDuration} ease-out`,
  backgroundColor: cssVar('backgroundMain'),
  '&[aria-checked="true"]': {
    backgroundColor: cssVar('backgroundMain'),
  },
});

const checkboxSwitchStyles = css({
  background: BooleanCheckboxUnselectedsvgStringdataUri,
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  backgroundRepeat: 'no-repeat',
});

const activeSwitchStyles = css({
  left: `calc(100% - 20px)`,
});

const activeCheckboxStyles = css({
  background: BooleanCheckboxSelectedsvgStringdataUri,
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  backgroundRepeat: 'no-repeat',
});

export interface ToggleProps {
  parentType?: 'table' | 'input';
  active?: boolean;
  onChange?: (newActive: boolean) => void;
  ariaRoleDescription?: string;
  disabled?: boolean;
}

export const Toggle = ({
  active,
  onChange = noop,
  ariaRoleDescription,
  parentType = 'input',
  disabled = false,
}: ToggleProps): ReturnType<FC> => {
  const skinny = parentType !== 'input';
  return (
    <button
      aria-roledescription={ariaRoleDescription}
      css={[
        toggleStyles(skinny),
        skinny && active && activeCheckboxBgStyles,
        !skinny && disabled && disabledSwitchBgStyles,
      ]}
      onClick={() => {
        onChange(!active);
      }}
      disabled={disabled}
      aria-checked={active}
      data-testid="toggle-cell-editor"
    >
      <span
        role="checkbox"
        aria-checked={active}
        css={[
          skinny ? checkboxSwitchStyles : toggleSwitchStyles,
          skinny
            ? active && activeCheckboxStyles
            : active && activeSwitchStyles,
        ]}
      />
    </button>
  );
};
