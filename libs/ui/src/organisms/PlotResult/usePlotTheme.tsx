import { useThemeFromStore } from '@decipad/react-contexts';
import { ComponentProps } from 'react';
import { VegaLite } from 'react-vega';
import { dark as darkTheme } from 'vega-themes';

type PlotTheme = ComponentProps<typeof VegaLite>['config'];

const customDarkTheme = () => ({
  ...darkTheme,
  background: 'transparent',
});

export const usePlotTheme = (): PlotTheme => {
  const [dark] = useThemeFromStore();

  return dark
    ? customDarkTheme()
    : {
        background: 'transparent',
      };
};
