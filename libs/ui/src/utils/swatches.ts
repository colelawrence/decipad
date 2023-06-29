import {
  blue100,
  blue200,
  blue600,
  blue700,
  brand200,
  brand500,
  brand700,
  brand800,
  grey100,
  grey200,
  grey500,
  grey600,
  OpaqueColor,
  opaqueColorToHex,
  orange100,
  orange200,
  orange600,
  orange800,
  purple100,
  purple200,
  purple600,
  purple700,
  red100,
  red50,
  red600,
  red700,
  yellow100,
  yellow300,
  yellow700,
  yellow800,
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
  vivid: OpaqueColor;
}

type Swatches = Record<AvailableSwatchColor, SwatchColor>;

interface ThemedSwatchProps {
  readonly backgroundColor: OpaqueColor;
  readonly color: OpaqueColor;
  readonly vivid: OpaqueColor;
}

export type ThemedSwatch = Record<AvailableSwatchColor, ThemedSwatchProps>;
export type Swatch = Record<AvailableSwatchColor, OpaqueColor>;
type HexSwatch = Record<string, AvailableSwatchColor>;

export const colorSwatches: Swatches = {
  Catskill: {
    light: grey100,
    base: grey200,
    highlight: grey500,
    vivid: grey600,
  },
  Sulu: {
    light: brand200,
    base: brand500,
    highlight: brand800,
    vivid: brand700,
  },
  Sun: {
    light: yellow100,
    base: yellow300,
    highlight: yellow800,
    vivid: yellow700,
  },
  Grapefruit: {
    light: orange100,
    base: orange200,
    highlight: orange800,
    vivid: orange600,
  },
  Rose: {
    light: red50,
    base: red100,
    highlight: red700,
    vivid: red600,
  },
  Perfume: {
    light: purple100,
    base: purple200,
    highlight: purple700,
    vivid: purple600,
  },
  Malibu: {
    light: blue100,
    base: blue200,
    highlight: blue700,
    vivid: blue600,
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
      store[currentKey] = colorSwatches[currentKey].vivid;
    } else {
      // eslint-disable-next-line no-param-reassign
      store[currentKey] = colorSwatches[currentKey].base;
    }
    return store;
  }, {} as Swatch);

/**
 * Returns either the base swatch colour or the highlight depending on dark mode.
 *
 * @param isDarkNode
 */
export const bubblesThemed = (
  isDarkMode: boolean,
  variant: 'normal' | 'highlighted'
) =>
  swatchNames.reduce((store, currentKey) => {
    if (isDarkMode) {
      // eslint-disable-next-line no-param-reassign
      store[currentKey] = {
        backgroundColor: colorSwatches[currentKey].vivid,
        color: colorSwatches[currentKey].light,
        vivid: colorSwatches[currentKey].base,
      };
    } else {
      // eslint-disable-next-line no-param-reassign
      store[currentKey] = {
        backgroundColor:
          variant === 'normal'
            ? colorSwatches[currentKey].light
            : colorSwatches[currentKey].base,
        color: colorSwatches[currentKey].highlight,
        vivid: colorSwatches[currentKey].vivid,
      };
    }
    return store;
  }, {} as ThemedSwatch);
