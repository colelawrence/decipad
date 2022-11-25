import {
  blue100,
  brand200,
  brand500,
  grey100,
  grey200,
  grey500,
  grey600,
  malibu200,
  malibu700,
  malibu900,
  OpaqueColor,
  orange100,
  orange300,
  orange700,
  orange900,
  perfume200,
  perfume700,
  perfume900,
  pink200,
  pink700,
  pink900,
  purple100,
  red100,
  sulu700,
  sulu900,
  sun500,
  sun700,
  sun900,
  yellow200,
} from '../primitives';

export type AvailableSwatchColor =
  | 'Catskill'
  | 'Sulu'
  | 'Sun'
  | 'Grapefruit'
  | 'Rose'
  | 'Perfume'
  | 'Malibu';

// Light is (currently) only used in the number catalogue.
interface SwatchColor {
  light: OpaqueColor;
  base: OpaqueColor;
  highlight: OpaqueColor;
  dark: OpaqueColor;
}

type Swatches = Record<AvailableSwatchColor, SwatchColor>;
type Swatch = Record<AvailableSwatchColor, OpaqueColor>;

export const colorSwatches: Swatches = {
  Catskill: {
    light: grey100,
    base: grey200,
    highlight: grey500,
    dark: grey600,
  },
  Sulu: {
    light: brand200,
    base: brand500,
    highlight: sulu700,
    dark: sulu900,
  },
  Sun: {
    light: yellow200,
    base: sun500,
    highlight: sun700,
    dark: sun900,
  },
  Grapefruit: {
    light: orange100,
    base: orange300,
    highlight: orange700,
    dark: orange900,
  },
  Rose: {
    light: red100,
    base: pink200,
    highlight: pink700,
    dark: pink900,
  },
  Perfume: {
    light: purple100,
    base: perfume200,
    highlight: perfume700,
    dark: perfume900,
  },
  Malibu: {
    light: blue100,
    base: malibu200,
    highlight: malibu700,
    dark: malibu900,
  },
};

export const swatchNames: AvailableSwatchColor[] = Object.keys(
  colorSwatches
) as AvailableSwatchColor[];
export const baseSwatches: Swatch = swatchNames.reduce((store, currentKey) => {
  // eslint-disable-next-line no-param-reassign
  store[currentKey] = colorSwatches[currentKey].base;
  return store;
}, {} as Swatch);
