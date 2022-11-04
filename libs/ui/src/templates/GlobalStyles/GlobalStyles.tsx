import { CSSReset as ChakraCssReset } from '@chakra-ui/css-reset';
import { Global } from '@emotion/react';
import emotionNormalize from 'emotion-normalize';
import emotionReset from 'emotion-reset';
import { FC } from 'react';
import { fromEvent } from 'rxjs';
import { useObservable } from 'rxjs-hooks';
import { delay, map } from 'rxjs/operators';
import {
  cssVar,
  darkTheme,
  GlobalTextStyles,
  p12Medium,
  p13Medium,
  p13SemiBold,
  p14Medium,
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
  backgroundColor: cssVar('successColor'),
  color: 'black',
};

const calendarHeaderStyles = {
  ...p13Medium,
  color: cssVar('normalTextColor'),
  paddingBottom: '16px',
  borderBottom: `solid 1px ${cssVar('highlightColor')}`,
  margin: 'auto 10px',
};

const datePickerHeaderStyles = {
  backgroundColor: 'white',
};

const DatePickerStyles: FC = () => {
  return (
    <Global
      styles={{
        'div.react-datepicker': {
          padding: '8px 0',
          borderRadius: '8px',
          border: `1px solid ${cssVar('strongerHighlightColor')}`,
        },
        'button.react-datepicker__navigation': {
          width: '4px',
          height: '4px',
          border: 'none',
          padding: '22px 2px',
          margin: '0 10px',
          color: cssVar('normalTextColor'),
        },
        'div.react-datepicker-popper[data-placement^=bottom] div.react-datepicker__triangle':
          {
            display: 'none',
          },
        'div.react-datepicker-popper[data-placement^=top] div.react-datepicker__triangle':
          {
            display: 'none',
          },
        'div.react-datepicker-popper[data-placement^=bottom] div.react-datepicker__triangle::before':
          {
            borderBottomColor: cssVar('strongerHighlightColor'),
          },
        'div.react-datepicker-popper[data-placement^=top] div.react-datepicker__triangle::before':
          {
            borderTopColor: cssVar('strongerHighlightColor'),
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
          borderBottomColor: cssVar('highlightColor'),
        },
        'div.react-datepicker__month-container > div.react-datepicker__header > div.react-datepicker__current-month':
          calendarHeaderStyles,
        'div.react-datepicker__year--container > div.react-datepicker__header.react-datepicker-year-header':
          calendarHeaderStyles,
        'div.react-datepicker__month-container > div.react-datepicker__header.react-datepicker-year-header':
          calendarHeaderStyles,
        'div.react-datepicker__time-container.react-datepicker__time-container--with-today-button > div.react-datepicker__header.react-datepicker__header--time':
          { display: 'none' },
        'div.react-datepicker__time-container.react-datepicker__time-container--with-today-button > div.react-datepicker__time':
          {
            borderRadius: '8px',
            border: `1px solid ${cssVar('strongerHighlightColor')}`,
          },
        'div.react-datepicker__month-container > div.react-datepicker__header > div.react-datepicker__day-names':
          {
            paddingTop: '16px',
          },
        'div.react-datepicker .react-datepicker__header': { border: 'none' },
        '.react-datepicker .react-datepicker__time-container': {
          border: `none`,
          right: '-95px',
          backgroundColor: cssVar('backgroundColor'),
          ...p12Medium,
        },
        '.react-datepicker .react-datepicker__day-name , .react-datepicker .react-datepicker__time-name':
          {
            ...p14Medium,
            color: cssVar('weakerTextColor'),
          },
        'div.react-datepicker__today-button': {
          border: 'none',
          ...p13SemiBold,
          backgroundColor: cssVar('backgroundColor'),
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
        svg: {
          pointerEvents: 'none',
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
