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
          height: '100%',
          margin: '0 !important',
          padding: '0 !important',

          // A grid that aligns to the top like a block layout, but children can still control their alignSelf
          display: 'grid',
          alignItems: 'start',
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
      }}
    />
    <GlobalTextStyles />
    <DarkThemeStyles />
    {children}
  </>
);
