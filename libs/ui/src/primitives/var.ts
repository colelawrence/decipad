import type { Property } from 'csstype';
import { grey200 } from '.';

import { black, grey100, grey300, grey400, offWhite, white } from './color';

export interface CssVariables {
  readonly backgroundColor: Property.Color;
  readonly iconBackgroundColor: Property.Color;
  readonly offColor: Property.Color;

  readonly highlightColor: Property.Color;
  readonly strongHighlightColor: Property.Color;

  readonly weakTextColor: Property.Color;
  readonly normalTextColor: Property.Color;
  readonly strongTextColor: Property.Color;

  readonly currentTextColor: Property.Color;
}
const defaults: CssVariables = {
  backgroundColor: white.rgb,
  iconBackgroundColor: grey200.rgb,
  offColor: offWhite.rgb,

  highlightColor: grey100.rgb,
  strongHighlightColor: grey200.rgb,

  weakTextColor: grey300.rgb,
  normalTextColor: grey400.rgb,
  strongTextColor: black.rgb,

  get currentTextColor() {
    return cssVar('normalTextColor');
  },
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
  // TypeScript widens the dynamic propery key to plain `string`
  return {
    [`${cssVariablePrefix}${name}`]: value,
  } as unknown as Record<CssVariableKey<V>, CssVariables[V]>;
}
