import { css } from '@emotion/react';
import { FC } from 'react';
import { noop } from '@decipad/utils';
import { cssVar, shortAnimationDuration } from '../../primitives';

// Skinny = true means the toggle will be in a table.
// Therefore needs to be smaller
const toggleStyles = (skinny: boolean) =>
  css({
    backgroundColor: cssVar('strongHighlightColor'),
    width: skinny ? '34px' : '46px',
    height: skinny ? '18px' : '24px',
    borderRadius: '100vmax',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    transition: `background-color ${shortAnimationDuration} ease-in-out`,
    position: 'relative',
  });

const activeToggleStyles = css({
  backgroundColor: cssVar('normalTextColor'),
});

const toggleSwitchStyles = (skinny: boolean) =>
  css({
    backgroundColor: cssVar('backgroundColor'),
    width: skinny ? '14px' : '18px',
    height: skinny ? '14px' : '18px',
    borderRadius: '100vmax',
    position: 'absolute',
    left: '2px',
    transition: `left ${shortAnimationDuration} ease-out`,
  });

const activeSwitchStyles = (skinny: boolean) =>
  css({
    left: `calc(100% - ${skinny ? '16px' : '20px'})`,
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
      css={[toggleStyles(skinny), active && activeToggleStyles]}
      onClick={() => {
        onChange(!active);
      }}
    >
      <span
        role="checkbox"
        aria-checked={active}
        css={[toggleSwitchStyles(skinny), active && activeSwitchStyles(skinny)]}
      />
    </button>
  );
};
