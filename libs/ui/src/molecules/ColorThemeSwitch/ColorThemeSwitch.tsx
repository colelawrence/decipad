import { useThemeFromStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { useCallback } from 'react';
import { cssVar, dark600, grey100, p13Regular } from '../../primitives';

export const ColorThemeSwitch = () => {
  const [, preferredMode, setModePreference] = useThemeFromStore();

  const setSystemMode = useCallback(() => {
    setModePreference('system');
  }, [setModePreference]);

  const setDarkMode = useCallback(() => {
    setModePreference('dark');
  }, [setModePreference]);

  const setLightMode = useCallback(() => {
    setModePreference('light');
  }, [setModePreference]);

  const allToggles = (
    <form css={themeSwitcherStyles}>
      <div css={themeButtonStyles}>
        <label css={autoModeStyles} htmlFor="color-theme-auto" />

        <span>
          <input
            id="color-theme-auto"
            type="radio"
            name="theme"
            value="auto"
            onChange={setSystemMode}
            defaultChecked={preferredMode === 'system'}
          />
          <label htmlFor="color-theme-auto" css={labelStyles}>
            Auto
          </label>
        </span>
      </div>

      <div css={themeButtonStyles}>
        <label css={themePreviewStyles} htmlFor="color-theme-light" />

        <span>
          <input
            id="color-theme-light"
            type="radio"
            name="theme"
            value="light"
            onChange={setLightMode}
            defaultChecked={preferredMode === 'light'}
          />
          <label htmlFor="color-theme-light" css={labelStyles}>
            Light
          </label>
        </span>
      </div>

      <div css={themeButtonStyles}>
        <label css={darkModeStyles} htmlFor="color-theme-dark" />

        <span>
          <input
            id="color-theme-dark"
            type="radio"
            name="theme"
            value="dark"
            onChange={setDarkMode}
            defaultChecked={preferredMode === 'dark'}
          />
          <label htmlFor="color-theme-dark" css={labelStyles}>
            Dark
          </label>
        </span>
      </div>
    </form>
  );

  return allToggles;
};

const themeSwitcherStyles = css({
  display: 'flex',
  gap: '16px',
});

const themeButtonStyles = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px',
});

const labelStyles = css(p13Regular, {
  color: cssVar('textSubdued'),

  width: '100%',
  marginLeft: '8px',
});

const themePreviewStyles = css({
  height: '56px',
  width: '100%',
  borderRadius: '12px',

  border: `1px solid ${cssVar('borderSubdued')}`,
  backgroundColor: grey100.rgb,

  cursor: 'pointer',
});

const darkModeStyles = css(themePreviewStyles, {
  backgroundColor: dark600.rgb,
});

const autoModeStyles = css(themePreviewStyles, {
  background:
    'linear-gradient(203deg, rgb(41 40 58) 0%, rgb(41 40 58) 50%, rgb(245 247 250) 50%, rgb(245 247 250) 100%)',
});
