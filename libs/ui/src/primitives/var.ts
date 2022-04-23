import type { Property } from 'csstype';
import {
  black,
  brand500,
  grey100,
  grey200,
  grey400,
  grey300,
  grey500,
  grey600,
  malibu200,
  malibu700,
  malibu900,
  sun500,
  sun700,
  sun900,
  offWhite,
  orange500,
  perfume200,
  perfume700,
  perfume900,
  pink200,
  pink700,
  pink900,
  red500,
  sulu700,
  sulu900,
  white,
  OpaqueColor,
} from './color';

export interface CssVariables {
  // Accent

  readonly successColor: Property.Color;
  readonly dangerColor: Property.Color;
  readonly warningColor: Property.Color;

  // Fill

  readonly backgroundColor: Property.Color;
  readonly iconBackgroundColor: Property.Color;
  readonly offColor: Property.Color;

  // Highlighting

  readonly highlightColor: Property.Color;
  readonly strongHighlightColor: Property.Color;
  readonly strongerHighlightColor: Property.Color;

  // Text
  readonly weakerTextColor: Property.Color;
  readonly weakTextColor: Property.Color;
  readonly normalTextColor: Property.Color;
  readonly strongTextColor: Property.Color;

  readonly currentTextColor: Property.Color;
}

const defaults: CssVariables = {
  successColor: brand500.rgb,
  dangerColor: red500.rgb,
  warningColor: orange500.rgb,

  backgroundColor: white.rgb,
  iconBackgroundColor: grey200.rgb,
  offColor: offWhite.rgb,

  highlightColor: grey100.rgb,
  strongHighlightColor: grey200.rgb,
  strongerHighlightColor: grey300.rgb,

  weakerTextColor: grey400.rgb,
  weakTextColor: grey500.rgb,
  normalTextColor: grey600.rgb,
  strongTextColor: black.rgb,

  get currentTextColor() {
    return cssVar('normalTextColor');
  },
};

interface SwatchColor {
  base: OpaqueColor;
  highlight: OpaqueColor;
  dark: OpaqueColor;
}

interface Swatches {
  [key: string]: SwatchColor;
}

interface Swatch {
  [key: string]: OpaqueColor;
}

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

export const swatchNames: string[] = Object.keys(colorSwatches);
export const baseSwatches: Swatch = swatchNames.reduce((store, currentKey) => {
  // eslint-disable-next-line no-param-reassign
  store[currentKey] = colorSwatches[currentKey].base;
  return store;
}, {} as Swatch);

const cssVariablePrefix = '--deci-';
export type CssVariableKey<V extends keyof CssVariables> =
  `${typeof cssVariablePrefix}${V}`;

export function cssVar<V extends keyof CssVariables>(
  name: V
): Exclude<CssVariables[V], undefined> {
  // This needs to be cast because we're cheating here:
  // We're claiming to return a concrete value for a CSS property such as `color`,
  // but really we're always returning a `var(--deci-something)` string.
  // However, this has the advantage that it prevents assigning a CSS variable to an unsuitable CSS property,
  // e.g. `var(--deci-some-color)` to `display`.
  return `var(${cssVariablePrefix}${name}, ${defaults[name]})` as Exclude<
    CssVariables[V],
    undefined
  >;
}
export function setCssVar<V extends keyof CssVariables>(
  name: V,
  value: CssVariables[V]
): Record<CssVariableKey<V>, CssVariables[V]> {
  // This needs to be cast because
  // TypeScript widens the dynamic propery key to plain `string`
  return {
    [`${cssVariablePrefix}${name}`]: value,
  } as unknown as Record<CssVariableKey<V>, CssVariables[V]>;
}
