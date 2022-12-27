import { useThemeFromStore } from '@decipad/react-contexts';
import { ComponentProps } from 'react';
import { dark as darkTheme } from 'vega-themes';
import { VegaLite } from 'react-vega';

type PlotTheme = ComponentProps<typeof VegaLite>['config'];

const customDarkTheme = () => ({
  ...darkTheme,
  background: 'transparent',
});

export const usePlotTheme = (): PlotTheme => {
  const [dark] = useThemeFromStore();

  return dark ? customDarkTheme() : undefined;
};
