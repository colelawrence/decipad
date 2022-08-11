import { fromEvent } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { CSSReset as ChakraCssReset } from '@chakra-ui/css-reset';
import { Global } from '@emotion/react';
import emotionNormalize from 'emotion-normalize';
import emotionReset from 'emotion-reset';

import { cssVar, darkTheme, GlobalTextStyles } from '../../primitives';
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
          ':root': darkTheme,
        },
      }}
    />
  ) : null;
};

export const GlobalStyles: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => (
  <>
    <Global styles={emotionNormalize} />
    <Global styles={emotionReset} />
    <ChakraCssReset />
    <Global
      styles={{
        '*': {
          boxSizing: 'border-box',
        },
        'html, body, #root': {
          width: '100%',
          minHeight: '100%',
          margin: '0 !important',
          padding: '0 !important',

          display: 'grid',
          gridTemplateRows: '100%',
          overflowX: 'hidden',

          backgroundColor: cssVar('backgroundColor'),
        },
        'button, [type="button"], [type="reset"], [type="submit"]': {
          WebkitAppearance: 'none',
        },
        // further resets
        '*:focus-visible': {
          outline: 'none',
        },
        '@media print': {
          body: {
            padding: '48px',
          },
          header: {
            display: 'none',
          },
        },
      }}
    />
    <GlobalTextStyles />
    <DarkThemeStyles />
    {children}
  </>
);
