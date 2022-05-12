import type { Property } from 'csstype';
import {
  brand300,
  grey100,
  grey200,
  grey300,
  grey400,
  grey500,
  grey600,
  offBlack,
  offWhite,
  red500,
  white,
  orange100,
  yellow600,
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

  // Code
  readonly variableHighlightColor: Property.Color;
  readonly unknownIdentifierHighlightColor: Property.Color;
}

const defaults: CssVariables = {
  successColor: brand300.rgb,
  dangerColor: red500.rgb,
  warningColor: yellow600.rgb,

  backgroundColor: white.rgb,
  iconBackgroundColor: grey200.rgb,
  offColor: offWhite.rgb,

  highlightColor: grey100.rgb,
  strongHighlightColor: grey200.rgb,
  strongerHighlightColor: grey300.rgb,

  weakerTextColor: grey400.rgb,
  weakTextColor: grey500.rgb,
  normalTextColor: grey600.rgb,
  strongTextColor: offBlack.rgb,

  get currentTextColor() {
    return cssVar('normalTextColor');
  },

  variableHighlightColor: orange100.rgb,
  unknownIdentifierHighlightColor: grey200.rgb,
};

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
  // TypeScript widens the dynamic property key to plain `string`
  return {
    [`${cssVariablePrefix}${name}`]: value,
  } as unknown as Record<CssVariableKey<V>, CssVariables[V]>;
}
