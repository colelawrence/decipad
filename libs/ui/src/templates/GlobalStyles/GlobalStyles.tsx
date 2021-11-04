import { fromEvent } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { Global } from '@emotion/react';
import emotionNormalize from 'emotion-normalize';
import emotionReset from 'emotion-reset';

import {
  cssVar,
  CssVariableKey,
  CssVariables,
  globalTextStyles,
  setCssVar,
} from '../../primitives';
import {
  black,
  grey100,
  grey200,
  grey300,
  grey400,
  white,
} from '../../primitives/color';
import { ALLOW_DARK_THEME_LOCAL_STORAGE_KEY } from '../../utils';

const darkTheme: Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
> = {
  ...setCssVar('backgroundColor', black.rgb),
  ...setCssVar('iconBackgroundColor', grey300.rgb),
  ...setCssVar('offColor', grey400.rgb),

  ...setCssVar('highlightColor', grey400.rgb),
  ...setCssVar('strongHighlightColor', grey300.rgb),

  ...setCssVar('weakTextColor', grey200.rgb),
  ...setCssVar('normalTextColor', grey100.rgb),
  ...setCssVar('strongTextColor', white.rgb),

  ...setCssVar('currentTextColor', cssVar('normalTextColor')),
};
const allowDarkTheme = () =>
  window.localStorage.getItem(ALLOW_DARK_THEME_LOCAL_STORAGE_KEY) === 'true';
const DarkThemeStyles = (): ReturnType<React.FC> => {
  const darkThemeAllowed = useObservable(
    () => fromEvent(window, 'storage').pipe(delay(0), map(allowDarkTheme)),
    allowDarkTheme()
  );
  return darkThemeAllowed ? (
    <Global
      styles={{
        '@media (prefers-color-scheme: dark)': {
          ':root': darkTheme,
        },
      }}
    />
  ) : null;
};

export const GlobalStyles: React.FC = ({ children }) => (
  <>
    <Global styles={emotionNormalize} />
    <Global styles={emotionReset} />
    <Global
      styles={{
        '*': {
          boxSizing: 'border-box',
        },
        'html, body, #root, #__next': {
          width: '100%',
          height: '100%',
          margin: '0 !important',
          padding: '0 !important',
          backgroundColor: cssVar('backgroundColor'),
        },
        // further resets
        '*:focus-visible': {
          outline: 'none',
        },
      }}
    />
    <Global styles={globalTextStyles} />
    <DarkThemeStyles />
    {children}
  </>
);
