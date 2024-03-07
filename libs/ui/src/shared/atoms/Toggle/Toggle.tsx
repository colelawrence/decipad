/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BooleanCheckboxSelected,
  BooleanCheckboxUnselected,
} from '../../../icons';
import {
  componentCssVars,
  cssVar,
  shortAnimationDuration,
} from '../../../primitives';

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
  '&[aria-checked="true"]': {
    background: BooleanCheckboxUnselectedsvgStringdataUri,
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  span: {
    background: BooleanCheckboxUnselectedsvgStringdataUri,
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundRepeat: 'no-repeat',
    '&[aria-checked="true"]': {
      background: BooleanCheckboxSelectedsvgStringdataUri,
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      backgroundRepeat: 'no-repeat',
    },
  },
});

const makeToggle = css({
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
  span: {
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
});

const makeNormalToggle = css(makeToggle, {
  width: '46px',
  height: '24px',
  span: {
    width: '18px',
    height: '18px',
    '&[aria-checked="true"]': {
      left: `calc(100% - 20px)`,
    },
  },
});

const makeSmallToggle = css(makeToggle, {
  width: '34px',
  height: '18px',
  span: {
    width: '14px',
    height: '14px',
    '&[aria-checked="true"]': {
      left: `calc(100% - 16px)`,
    },
  },
});

export interface ToggleProps {
  active?: boolean;
  onChange?: (newActive: boolean) => void;
  ariaRoleDescription?: string;
  disabled?: boolean;
  variant?: 'checkbox' | 'toggle' | 'small-toggle';
}

const CheckboxToggle: FC<Omit<ToggleProps, 'variant'>> = ({
  ariaRoleDescription,
  active,
  onChange = noop,
  disabled = false,
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
      <span role="checkbox" aria-checked={active} />
    </button>
  );
};

const NormalToggle: FC<ToggleProps> = ({
  ariaRoleDescription,
  active,
  onChange = noop,
  disabled = false,
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
      <span role="checkbox" aria-checked={active} />
    </button>
  );
};

const SmallToggle: FC<ToggleProps> = ({
  ariaRoleDescription,
  active,
  onChange = noop,
  disabled = false,
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
      <span role="checkbox" aria-checked={active} />
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
