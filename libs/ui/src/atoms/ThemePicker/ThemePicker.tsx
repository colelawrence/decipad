import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import * as icons from '../../icons';
import { cssVar, shortAnimationDuration } from '../../primitives';

export interface ToggleProps {
  active?: boolean;
  onChange?: (newActive: boolean) => void;
  ariaRoleDescription?: string;
}

export const ThemePicker = ({
  active,
  onChange = noop,
  ariaRoleDescription,
}: ToggleProps): ReturnType<FC> => {
  return (
    <button
      aria-roledescription={ariaRoleDescription}
      css={[themePickerStyles, active && activeThemePickerStyles]}
      onClick={() => {
        onChange(!active);
      }}
    >
      <span
        role="checkbox"
        aria-checked={active}
        css={[toggleThemeSwitchStyles, active && activeThemeSwitchStyles]}
      />
      <span css={[themeIconStyles, { top: 8, left: 8 }]}>
        <icons.Sun />
      </span>
      <span css={[themeIconStyles, { bottom: 8, left: 8 }]}>
        <icons.MoonTheme />
      </span>
    </button>
  );
};

const themeIconStyles = css({
  position: 'absolute',
  height: '16px',
  width: '16px',
});

const themePickerStyles = css({
  backgroundColor: cssVar('strongHighlightColor'),
  width: '32px',
  height: '64px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  padding: '2px',
  transition: `background-color ${shortAnimationDuration} ease-in-out`,
  position: 'relative',
});

const activeThemePickerStyles = css({
  backgroundColor: cssVar('strongHighlightColor'),
});

const toggleThemeSwitchStyles = css({
  backgroundColor: cssVar('backgroundColor'),
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  position: 'absolute',
  top: '2px',
  transition: `top ${shortAnimationDuration} ease-out`,
});

const activeThemeSwitchStyles = css({
  top: 'calc(100% - 30px)',
});
