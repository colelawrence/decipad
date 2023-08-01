import { CSSReset as ChakraCssReset } from '@chakra-ui/css-reset';
import { useThemeFromStore } from '@decipad/react-contexts';
import { Global } from '@emotion/react';
import emotionNormalize from 'emotion-normalize';
import emotionReset from 'emotion-reset';
import { FC } from 'react';
import {
  cssVar,
  darkTheme,
  GlobalTextStyles,
  GlobalComponentStyles,
  lightTheme,
  mediumShadow,
  p12Medium,
  p13Medium,
  p14Medium,
  strongOpacity,
} from '../../primitives';

const DarkThemeStyles = (): ReturnType<React.FC> => {
  const [darkThemeAllowed] = useThemeFromStore();
  return darkThemeAllowed ? (
    <Global
      styles={{
        ':root': darkTheme,
      }}
    />
  ) : (
    <Global
      styles={{
        ':root': lightTheme,
      }}
    />
  );
};

const dateCellStyles = {
  backgroundColor: cssVar('stateOkBackground'),
  color: 'black',
};

const calendarHeaderStyles = {
  ...p13Medium,
  color: cssVar('textDefault'),
  paddingBottom: '16px',
  borderBottom: `solid 1px ${cssVar('backgroundDefault')}`,
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
          border: `1px solid ${cssVar('borderSubdued')}`,
        },
        'button.react-datepicker__navigation': {
          width: '4px',
          height: '4px',
          border: 'none',
          padding: '22px 2px',
          margin: '0 10px',
          color: cssVar('textDefault'),
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
            borderBottomColor: cssVar('borderSubdued'),
          },
        'div.react-datepicker-popper[data-placement^=top] div.react-datepicker__triangle::before':
          {
            borderTopColor: cssVar('borderSubdued'),
          },
        'div.react-datepicker-popper[data-placement^=bottom] div.react-datepicker__triangle::after':
          {
            borderBottomColor: cssVar('backgroundMain'),
          },
        'div.react-datepicker-popper[data-placement^=top] div.react-datepicker__triangle::after':
          {
            borderTopColor: cssVar('backgroundMain'),
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
          borderBottomColor: cssVar('backgroundDefault'),
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
            border: `1px solid ${cssVar('borderSubdued')}`,
          },
        'div.react-datepicker__month-container > div.react-datepicker__header > div.react-datepicker__day-names':
          {
            paddingTop: '16px',
          },
        'div.react-datepicker .react-datepicker__header': { border: 'none' },
        '.react-datepicker__day--outside-month': {
          color: `${cssVar('backgroundHeavy')} !important`,
          pointerEvents: 'none',
        },
        '.react-datepicker .react-datepicker__time-container': {
          border: `none`,
          right: '-95px',
          backgroundColor: cssVar('backgroundMain'),
          ...p12Medium,
        },
        '.react-datepicker .react-datepicker__day-name , .react-datepicker .react-datepicker__time-name':
          {
            ...p14Medium,
            color: cssVar('textDisabled'),
          },
        'div.react-datepicker__today-button': {
          border: 'none',
          ...p13Medium,
          backgroundColor: cssVar('backgroundMain'),
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
          minWidth: '320px',
          minHeight: '100%',
          margin: '0 !important',
          padding: '0 !important',

          display: 'grid',
          gridTemplateRows: '100%',
          overflowX: 'hidden',

          position: 'relative',

          backgroundColor: cssVar('backgroundMain'),
        },
        'button, [type="button"], [type="reset"], [type="submit"]': {
          WebkitAppearance: 'none',
        },
        '::-moz-selection, ::selection': {
          backgroundColor: cssVar('backgroundHeavy'),
        },

        '.slate-selection-area': {
          background: cssVar('backgroundHeavy'),
          borderRadius: 8,
          opacity: strongOpacity,
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
        // excalidraw

        '.excalidraw button[aria-label="Menu"], .excalidraw button[aria-label="Undo"], .excalidraw button[aria-label="Redo"], .excalidraw .popover ul, .excalidraw label.ToolIcon:has(.ToolIcon_lock, .ToolIcon_type_checkbox), .excalidraw label[title="Insert image — 9"], .excalidraw .ToolIcon__keybinding, .excalidraw label.color-input-container':
          {
            display: 'none',
          },
        '.excalidraw main': {
          backgroundColor: cssVar('backgroundMain'),
          width: '100%',
          height: '100%',
        },
        '.excalidraw div .ToolIcon__icon': {
          width: '32px',
          height: '32px',
          backgroundColor: cssVar('backgroundDefault'),
          borderRadius: 6,
        },
        'div.App-bottom-bar > div.Island, div.App-bottom-bar > div.Island > footer.App-toolbar':
          {
            boxShadow: 'none',
            border: '0',
            backgroundColor: 'transparent',
          },
        '.excalidraw button.ToolIcon': {
          border: `1px solid ${cssVar('borderSubdued')}`,
        },
        '.excalidraw .Island.App-toolbar': {
          padding: '4px',
          border: `1px solid ${cssVar('borderSubdued')}`,
          boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,
          borderRadius: '8px',
        },
        // other stuff
        'body>textarea + div': {
          zIndex: '100 !important',
        },
      }}
    />
    <GlobalTextStyles />
    <DarkThemeStyles />
    <DatePickerStyles />
    <GlobalComponentStyles />
    {children}
  </>
);
