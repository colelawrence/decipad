import { fromEvent } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { Global } from '@emotion/react';
import emotionNormalize from 'emotion-normalize';
import emotionReset from 'emotion-reset';

import { cssVar, globalTextStyles, setCssVar } from '../../primitives';
import { black, offWhite, white } from '../../primitives/color';
import { ALLOW_DARK_THEME_LOCAL_STORAGE_KEY } from '../../utils';

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
          ':root': {
            ...setCssVar('backgroundColor', black.rgb),
            ...setCssVar('weakTextColor', offWhite.rgb),
            ...setCssVar('strongTextColor', white.rgb),
          },
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
