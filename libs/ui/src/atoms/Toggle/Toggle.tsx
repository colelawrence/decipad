import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, shortAnimationDuration } from '../../primitives';

// Skinny = true means the toggle will be in a table.
// Therefore needs to be smaller
const toggleStyles = (skinny: boolean) => (skinny ? makeCheckbox : makeToggle);

const makeCheckbox = css({
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('weakTextColor')}`,
  width: '16px',
  height: '16px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
});

const makeToggle = css({
  backgroundColor: cssVar('strongHighlightColor'),
  width: '46px',
  height: '24px',
  borderRadius: '100vmax',
  display: 'flex',
  alignItems: 'center',
  padding: '2px',
  transition: `background-color ${shortAnimationDuration} ease-in-out`,
  position: 'relative',
});

const activeSwitchBgStyles = css({
  backgroundColor: cssVar('normalTextColor'),
});

const activeCheckboxBgStyles = css({
  backgroundColor: cssVar('strongTextColor'),
  border: `1px solid ${cssVar('strongTextColor')}`,
});

const toggleSwitchStyles = css({
  backgroundColor: cssVar('backgroundColor'),
  width: '18px',
  height: '18px',
  borderRadius: '100vmax',
  position: 'absolute',
  left: '2px',
  transition: `left ${shortAnimationDuration} ease-out`,
});

const checkboxSwitchStyles = css({
  backgroundColor: cssVar('backgroundColor'),
  width: '8px',
  height: '8px',
  margin: '3.1px',
  position: 'absolute',
});

const activeSwitchStyles = css({
  left: `calc(100% - 20px)`,
});

const activeCheckboxStyles = css({
  transformX: 'rotate(12deg)',
  clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)',
});

export interface ToggleProps {
  parentType?: 'table' | 'input';
  active?: boolean;
  onChange?: (newActive: boolean) => void;
  ariaRoleDescription?: string;
}

export const Toggle = ({
  active,
  onChange = noop,
  ariaRoleDescription,
  parentType = 'input',
}: ToggleProps): ReturnType<FC> => {
  const skinny = parentType !== 'input';
  return (
    <button
      aria-roledescription={ariaRoleDescription}
      css={[
        toggleStyles(skinny),
        skinny
          ? active && activeCheckboxBgStyles
          : active && activeSwitchBgStyles,
      ]}
      onClick={() => {
        onChange(!active);
      }}
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
