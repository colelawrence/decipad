import { fromEvent } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { CSSReset as ChakraCssReset } from '@chakra-ui/css-reset';
import { Global } from '@emotion/react';
import emotionNormalize from 'emotion-normalize';
import emotionReset from 'emotion-reset';
import { FC } from 'react';
import {
  brand500,
  cssVar,
  darkTheme,
  GlobalTextStyles,
  grey100,
  grey500,
  grey300,
} from '../../primitives';
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

const dateCellStyles = {
  backgroundColor: brand500.rgb,
  color: 'black',
};

const datePickerHeaderStyles = {
  backgroundColor: 'white',
};

const DatePickerStyles: FC = () => {
  return (
    <Global
      styles={{
        'div.react-datepicker': {
          padding: '8px',
          borderRadius: '8px',
          border: `1px solid ${grey300.rgb}`,
        },
        'div.react-datepicker-popper[data-placement^=bottom] div.react-datepicker__triangle':
          {
            borderBottomColor: grey300.rgb,
          },
        'div.react-datepicker-popper[data-placement^=top] div.react-datepicker__triangle':
          {
            borderTopColor: grey300.rgb,
          },
        'div.react-datepicker-popper[data-placement^=bottom] div.react-datepicker__triangle::before':
          {
            borderBottomColor: grey300.rgb,
          },
        'div.react-datepicker-popper[data-placement^=top] div.react-datepicker__triangle::before':
          {
            borderTopColor: grey300.rgb,
          },
        'div.react-datepicker-popper[data-placement^=bottom] div.react-datepicker__triangle::after':
          {
            borderBottomColor: cssVar('backgroundColor'),
          },
        'div.react-datepicker-popper[data-placement^=top] div.react-datepicker__triangle::after':
          {
            borderTopColor: cssVar('backgroundColor'),
          },
        '.react-datepicker__year-text.react-datepicker__year-text--keyboard-selected':
          dateCellStyles,
        '.react-datepicker__year-text.react-datepicker__year-text--selected':
          dateCellStyles,
        '.react-datepicker__year-text.react-datepicker__year--keyboard-selected':
          dateCellStyles,
        '.react-datepicker__month-text.react-datepicker__month-text--keyboard-selected':
          dateCellStyles,
        '.react-datepicker__day.react-datepicker__day--selected':
          dateCellStyles,
        '.react-datepicker__day.react-datepicker__day--keyboard-selected':
          dateCellStyles,
        '.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected[aria-selected]':
          dateCellStyles,
        '.react-datepicker__year--container .react-datepicker__header':
          datePickerHeaderStyles,
        '.react-datepicker__month-container .react-datepicker__header':
          datePickerHeaderStyles,
        '.react-datepicker__time-container .react-datepicker__header':
          datePickerHeaderStyles,
        '.react-datepicker .react-datepicker__header': {
          borderBottom: '1px solid',
          borderBottomColor: grey100.rgb,
        },
        '.react-datepicker .react-datepicker__time-container': {
          borderLeft: '1px solid',
          borderLeftColor: grey100.rgb,
        },
        '.react-datepicker .react-datepicker__day-name , .react-datepicker .react-datepicker__time-name':
          {
            color: grey500.rgb,
          },
      }}
    />
  );
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
    <DatePickerStyles />
    {children}
  </>
);
