import { DecoratorFn, Parameters, ArgTypes } from '@storybook/react';
import { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';
import { GlobalStyles } from '../src';
import {
  largestDesktop,
  smallestDesktop,
  smallestMobile,
} from '../src/primitives';

import { ALLOW_DARK_THEME_LOCAL_STORAGE_KEY } from '../src/utils';
import { dark, light } from './theme';

const withGlobalStyles: DecoratorFn = (StoryFn, context) => {
  return (
    <GlobalStyles>
      <StoryFn {...context} />
    </GlobalStyles>
  );
};

const SetAllowDarkMode: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const allowDarkMode = useDarkMode();
  useEffect(() => {
    localStorage.setItem(
      ALLOW_DARK_THEME_LOCAL_STORAGE_KEY,
      String(allowDarkMode)
    );
  }, [allowDarkMode]);
  return <>{children}</>;
};
const withDarkMode: DecoratorFn = (StoryFn, context) => {
  return (
    <SetAllowDarkMode>
      <StoryFn {...context} />
    </SetAllowDarkMode>
  );
};

const withPadding: DecoratorFn = (StoryFn, context) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: `${context.globals.padding}px`,
      }}
    >
      <StoryFn {...context} />
    </div>
  );
};

export const decorators: DecoratorFn[] = [
  withGlobalStyles,
  withDarkMode,
  withPadding,
];
export const globalTypes: ArgTypes = {
  padding: {
    name: 'Padding around component',
    defaultValue: 0,
    toolbar: {
      icon: 'box',
      items: [
        { value: 0, title: 'None' },
        ...[2, 4, 6, 8, 10, 12, 16, 20, 24, 32].map((value) => ({
          value,
          title: `${value} pixels`,
        })),
      ],
    },
  },
};

export const parameters: Parameters = {
  darkMode: {
    dark: { ...dark },
    light: { ...light },
  },
  viewport: {
    viewports: Object.fromEntries(
      Object.entries({
        'Smallest Mobile': smallestMobile,
        'Smallest Desktop': smallestDesktop,
        'Largest Desktop': largestDesktop,
      }).map(([name, device]) => [
        name,
        {
          name,
          styles: {
            width: `${device.portrait.width}px`,
            height: `${device.portrait.height}px`,
          },
        },
      ])
    ),
  },
  options: {
    storySort: {
      order: [
        'Primitives',
        'Atoms',
        'Molecules',
        'Organisms',
        'Templates',
        'Pages',
        '*',
      ],
    },
  },
};
