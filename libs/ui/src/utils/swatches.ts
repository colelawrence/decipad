import {
  brand500,
  grey200,
  grey500,
  grey600,
  malibu200,
  malibu700,
  malibu900,
  OpaqueColor,
  perfume200,
  perfume700,
  perfume900,
  pink200,
  pink700,
  pink900,
  sulu700,
  sulu900,
  sun500,
  sun700,
  sun900,
} from '../primitives';

export type AvailableSwatchColor =
  | 'Catskill'
  | 'Sulu'
  | 'Sun'
  | 'Rose'
  | 'Perfume'
  | 'Malibu';

interface SwatchColor {
  base: OpaqueColor;
  highlight: OpaqueColor;
  dark: OpaqueColor;
}

type Swatches = Record<AvailableSwatchColor, SwatchColor>;
type Swatch = Record<AvailableSwatchColor, OpaqueColor>;

export const colorSwatches: Swatches = {
  Catskill: {
    base: grey200,
    highlight: grey500,
    dark: grey600,
  },
  Sulu: {
    base: brand500,
    highlight: sulu700,
    dark: sulu900,
  },
  Sun: {
    base: sun500,
    highlight: sun700,
    dark: sun900,
  },
  Rose: {
    base: pink200,
    highlight: pink700,
    dark: pink900,
  },
  Perfume: {
    base: perfume200,
    highlight: perfume700,
    dark: perfume900,
  },
  Malibu: {
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
