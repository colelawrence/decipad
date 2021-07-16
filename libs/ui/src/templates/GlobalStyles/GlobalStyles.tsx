import { fromEvent } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { Global } from '@emotion/react';
import emotionNormalize from 'emotion-normalize';
import emotionReset from 'emotion-reset';

import {
  cssVar,
  CssVariables,
  globalTextStyles,
  setCssVar,
} from '../../primitives';
import { black, grey100, grey200, white } from '../../primitives/color';
import { ALLOW_DARK_THEME_LOCAL_STORAGE_KEY } from '../../utils';

const darkTheme: CssVariables = {
  backgroundColor: black.rgb,

  weakTextColor: grey200.rgb,
  normalTextColor: grey100.rgb,
  strongTextColor: white.rgb,
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
          ':root': Object.entries(darkTheme)
            .map(([name, value]) =>
              setCssVar(name as keyof CssVariables, value)
            )
            .reduce(Object.assign, {}),
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
        'html, body, #root': {
          width: '100%',
          height: '100%',
          margin: '0 !important',
          padding: '0 !important',
          backgroundColor: cssVar('backgroundColor'),
        },
      }}
    />
    <Global styles={globalTextStyles} />
    <DarkThemeStyles />
    {children}
  </>
);
