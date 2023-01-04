import {
  blue100,
  blue700,
  brand200,
  brand500,
  brand700,
  grey100,
  grey200,
  grey500,
  grey700,
  malibu200,
  malibu700,
  OpaqueColor,
  opaqueColorToHex,
  orange100,
  orange300,
  orange700,
  perfume200,
  perfume700,
  pink200,
  pink700,
  purple100,
  purple700,
  red100,
  red700,
  sulu700,
  sun500,
  sun700,
  yellow200,
  yellow700,
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
export type Swatch = Record<AvailableSwatchColor, OpaqueColor>;
type HexSwatch = Record<string, AvailableSwatchColor>;

export const colorSwatches: Swatches = {
  Catskill: {
    light: grey100,
    base: grey200,
    highlight: grey500,
    dark: grey700,
  },
  Sulu: {
    light: brand200,
    base: brand500,
    highlight: sulu700,
    dark: brand700,
  },
  Sun: {
    light: yellow200,
    base: sun500,
    highlight: sun700,
    dark: yellow700,
  },
  Grapefruit: {
    light: orange100,
    base: orange300,
    highlight: orange700,
    dark: orange700,
  },
  Rose: {
    light: red100,
    base: pink200,
    highlight: pink700,
    dark: red700,
  },
  Perfume: {
    light: purple100,
    base: perfume200,
    highlight: perfume700,
    dark: purple700,
  },
  Malibu: {
    light: blue100,
    base: malibu200,
    highlight: malibu700,
    dark: blue700,
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
export const hexBaseSwatches: HexSwatch = swatchNames.reduce(
  (store, currentKey) => {
    const color = colorSwatches[currentKey].base;
    const key = opaqueColorToHex(color);
    // eslint-disable-next-line no-param-reassign
    store[key] = currentKey;
    return store;
  },
  {} as HexSwatch
);

/**
 * Returns either the base swatch colour or the highlight depending on dark mode.
 *
 * @param isDarkNode
 */
export const swatchesThemed: (isDarkMode: boolean) => Swatch = (
  isDarkMode: boolean
) =>
  swatchNames.reduce((store, currentKey) => {
    if (isDarkMode) {
      // eslint-disable-next-line no-param-reassign
      store[currentKey] = colorSwatches[currentKey].dark;
    } else {
      // eslint-disable-next-line no-param-reassign
      store[currentKey] = colorSwatches[currentKey].base;
    }
    return store;
  }, {} as Swatch);
