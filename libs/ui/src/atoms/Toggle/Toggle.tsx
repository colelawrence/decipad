import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, shortAnimationDuration } from '../../primitives';
import { noop } from '../../utils';

const toggleStyles = css({
  backgroundColor: cssVar('strongHighlightColor'),
  width: '34px',
  height: '18px',
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

const toggleSwitchStyles = css({
  backgroundColor: cssVar('backgroundColor'),
  width: '14px',
  height: '14px',
  borderRadius: '100vmax',
  position: 'absolute',
  left: '2px',
  transition: `left ${shortAnimationDuration} ease-out`,
});

const activeSwitchStyles = css({
  left: 'calc(100% - 16px)',
});

export interface ToggleProps {
  active?: boolean;
  onChange?: (newActive: boolean) => void;
}

export const Toggle = ({
  active,
  onChange = noop,
}: ToggleProps): ReturnType<FC> => {
  return (
    <button
      css={[toggleStyles, active && activeToggleStyles]}
      onClick={() => {
        onChange(!active);
      }}
    >
      <span
        role="checkbox"
        aria-checked={active}
        css={[toggleSwitchStyles, active && activeSwitchStyles]}
      />
    </button>
  );
};
