import { Meta, Story } from '@storybook/react';
import * as colors from './color';
import { OpaqueColor } from './color';

type ColorId = Exclude<
  keyof typeof import('./color'),
  'color' | 'transparency'
>;

const wrapperStyle = {
  display: 'grid',
  gridGap: '5px',
  gridTemplateColumns: '100px 100px 100px',
};

const colorNames: Record<ColorId, string> = {
  offBlack: 'Off-Black',
  black: 'Black',
  white: 'White',
  offWhite: 'Off-White',
  grey50: 'Grey 50',
  grey100: 'Grey 100',
  grey200: 'Grey 200',
  grey300: 'Grey 300',
  grey400: 'Grey 400',
  grey500: 'Grey 500',
  grey600: 'Grey 600',
  grey700: 'Grey 700',

  brand50: 'Brand 50',
  brand100: 'Brand 100',
  brand200: 'Brand 200',
  brand300: 'Brand 300',
  brand400: 'Brand 400',
  brand500: 'Brand 500',
  brand600: 'Brand 600',
  brand700: 'Brand 700',
  brand800: 'Brand 800',
  brand900: 'Brand 900',

  red100: 'Red 100',
  red200: 'Red 200',
  red300: 'Red 300',
  red400: 'Red 400',
  red500: 'Red 500',
  red600: 'Red 600',
  red700: 'Red 700',
  red800: 'Red 800',
  red900: 'Red 900',

  yellow50: 'Yellow 50',
  yellow100: 'Yellow 100',
  yellow200: 'Yellow 200',
  yellow300: 'Yellow 300',
  yellow400: 'Yellow 400',
  yellow500: 'Yellow 500',
  yellow600: 'Yellow 600',
  yellow700: 'Yellow 700',
  yellow800: 'Yellow 800',
  yellow900: 'Yellow 900',

  orange100: 'Orange 100',
  orange200: 'Orange 200',
  orange300: 'Orange 300',
  orange400: 'Orange 400',
  orange500: 'Orange 500',
  orange600: 'Orange 600',
  orange700: 'Orange 700',
  orange800: 'Orange 800',
  orange900: 'Orange 900',

  purple100: 'Purple 100',
  purple200: 'Purple 200',
  purple300: 'Purple 300',
  purple400: 'Purple 400',
  purple500: 'Purple 500',
  purple600: 'Purple 600',
  purple700: 'Purple 700',
  purple800: 'Purple 800',
  purple900: 'Purple 900',

  teal50: 'Teal 50',
  teal100: 'Teal 100',
  teal200: 'Teal 200',
  teal300: 'Teal 300',
  teal400: 'Teal 400',
  teal500: 'Teal 500',
  teal600: 'Teal 600',
  teal700: 'Teal 700',
  teal800: 'Teal 800',
  teal900: 'Teal 900',

  blue50: 'Blue 50',
  blue100: 'Blue 100',
  blue200: 'Blue 200',
  blue300: 'Blue 300',
  blue400: 'Blue 400',
  blue500: 'Blue 500',
  blue600: 'Blue 600',
  blue700: 'Blue 700',
  blue800: 'Blue 800',
  blue900: 'Blue 900',

  sulu700: 'Color Swatch Sulu 700',
  sulu900: 'Color Swatch Sulu 900',

  pink200: 'Color Swatch Rose 200',
  pink700: 'Color Swatch Rose 700',
  pink900: 'Color Swatch Rose 900',

  perfume200: 'Color Swatch Perfume 200',
  perfume700: 'Color Swatch Perfume 700',
  perfume900: 'Color Swatch Perfume 900',

  malibu200: 'Color Swatch Malibu 200',
  malibu700: 'Color Swatch Malibu 700',
  malibu900: 'Color Swatch Malibu 900',

  sun500: 'Color Swatch Sun 500',
  sun700: 'Color Swatch Sun 700',
  sun900: 'Color Swatch Sun 900',

  lavender000: 'Lavender 000',

  normalOpacity: 'Normal Opacity',
  weakOpacity: 'Weak Opacity',
  strongOpacity: 'Strong Opacity',
};
export default {
  title: 'Primitives / Color',
} as Meta;

export const Normal: Story = () => (
  <div style={wrapperStyle}>
    {Object.keys(colorNames).map((colorName) => (
      <div
        role="presentation"
        css={{
          width: '100px',
          height: '24px',
          backgroundColor: (colors[colorName as ColorId] as OpaqueColor).rgb,
        }}
      >
        {colorName}
      </div>
    ))}
  </div>
);
