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
  p13Medium,
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

const DatePickerStyles: FC = () => {
  return (
    <Global
      styles={{
        'div.react-datepicker-wrapper': {
          width: '100%',
        },
        'div.react-datepicker-popper': {
          zIndex: 10,
          '&[data-placement^=bottom] div.react-datepicker__triangle': {
            display: 'none',
          },
          '&[data-placement^=top] div.react-datepicker__triangle': {
            display: 'none',
          },
          '&[data-placement^=bottom] div.react-datepicker__triangle::before': {
            borderBottomColor: cssVar('borderSubdued'),
          },
          '&[data-placement^=top] div.react-datepicker__triangle::before': {
            borderTopColor: cssVar('borderSubdued'),
          },
          '&[data-placement^=bottom] div.react-datepicker__triangle::after': {
            borderBottomColor: cssVar('backgroundMain'),
          },
          '&[data-placement^=top] div.react-datepicker__triangle::after': {
            borderTopColor: cssVar('backgroundMain'),
          },
        },
        '.react-datepicker': {
          '&&, & &__time-container, &__time-container--with-today-button': {
            padding: '6px 0px',
            borderRadius: '8px',
            background: cssVar('backgroundMain'),
            border: `1px solid ${cssVar('borderSubdued')}`,
          },

          '&__time': {
            '&&&': {
              backgroundColor: cssVar('backgroundMain'),
            },
          },

          '&__time-list': {
            '&::-webkit-scrollbar': {
              width: '4px',
            },

            '&::-webkit-scrollbar-track': {
              background: 'none',
            },

            '&::-webkit-scrollbar-thumb': {
              backgroundColor: cssVar('borderDefault'),
              borderRadius: '8px',
            },
          },

          '& &__navigation': {
            border: 'none',
            top: '9px',
            color: cssVar('textSubdued'),
          },

          '& &__navigation-icon': {
            '&::before': {
              borderColor: cssVar('textSubdued'),
              height: '4px',
              width: '4px',
              borderWidth: '2px 2px 0 0',
            },
          },

          '& &__navigation:hover &__navigation-icon': {
            '&::before': {
              borderColor: cssVar('textDefault'),
            },
          },

          '& &__header': {
            ...p13Medium,
            color: cssVar('textSubdued'),
            paddingBottom: '8px',
            borderBottom: `solid 1px ${cssVar('backgroundDefault')}`,
            backgroundColor: cssVar('backgroundMain'),
            borderRadius: '8px 8px 0px 0px',
          },

          '& &-time__header': {
            ...p13Medium,
            color: cssVar('textSubdued'),
          },

          '& &__day-names': {
            marginTop: '8px',
          },

          '& &__current-month': {
            ...p13Medium,
            color: cssVar('textSubdued'),
          },

          '& &__day-name': {
            ...p13Medium,
            color: cssVar('textSubdued'),
            margin: '2px',
          },

          '& &__day, & &__month-text, & &__year-text': {
            ...p13Medium,
            color: cssVar('textDefault'),
            lineHeight: '28px',
            width: '28px',
            margin: '2px',

            '&:hover': {
              backgroundColor: cssVar('backgroundHeavy'),
            },

            '&--outside-month': {
              opacity: '0.5',
            },

            '&--selected': {
              backgroundColor: cssVar('themeBackgroundDefault'),
              color: cssVar('themeTextDefault'),

              '&:hover': {
                backgroundColor: cssVar('themeBackgroundDefault'),
              },
            },
            '&--keyboard-selected': {
              backgroundColor: cssVar('themeBackgroundDefault'),
              color: cssVar('themeTextDefault'),

              '&:hover': {
                backgroundColor: cssVar('themeBackgroundDefault'),
              },
            },
          },

          '&__time-list-item': {
            // yes, this is the cleanest way to override specifity of react-datepicker
            '&&&&&&': {
              ...p13Medium,
              color: cssVar('textDefault'),
              lineHeight: '28px',
              height: 'auto',
              margin: '2px',
              padding: '2px 4px',
              borderRadius: '6px',

              '&:hover': {
                backgroundColor: cssVar('backgroundHeavy'),
              },

              '&--selected': {
                backgroundColor: cssVar('themeBackgroundDefault'),
                color: cssVar('themeTextDefault'),

                '&:hover': {
                  backgroundColor: cssVar('themeBackgroundDefault'),
                },
              },
              '&--keyboard-selected': {
                backgroundColor: cssVar('themeBackgroundDefault'),
                color: cssVar('themeTextDefault'),

                '&:hover': {
                  backgroundColor: cssVar('themeBackgroundDefault'),
                },
              },
            },
          },

          '& &__year-wrapper': {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            maxWidth: '100%',
          },

          '& &__today-button': {
            ...p13Medium,
            padding: '6px 12px',
            margin: 'auto 10px 4px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: cssVar('backgroundDefault'),
            color: cssVar('textDefault'),

            '&:hover': {
              backgroundColor: cssVar('backgroundHeavy'),
            },
          },
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
