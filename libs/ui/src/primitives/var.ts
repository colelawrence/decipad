import { CSSObject } from '@emotion/react';
import { black, grey400, white } from './color';

export interface CssVariables {
  readonly backgroundColor: CSSObject['backgroundColor'];

  readonly strongTextColor: CSSObject['color'];
  readonly weakTextColor: CSSObject['color'];
}
const defaults: CssVariables = {
  backgroundColor: white.rgb,

  strongTextColor: black.rgb,
  weakTextColor: grey400.rgb,
};

export function cssVar<V extends keyof CssVariables>(
  name: V
): Exclude<CssVariables[V], undefined> {
  // This needs to be cast because we're cheating here:
  // We're claiming to return a concrete value for a CSS property such as `color`,
  // but really we're always returning a `var(--deci-something)` string.
  // However, this has the advantage that it prevents assigning a CSS variable to an unsuitable CSS property,
  // e.g. `var(--deci-some-color)` to `display`.
  return `var(--deci-${name}, ${defaults[name]})` as Exclude<
    CssVariables[V],
    undefined
  >;
}
export function setCssVar<V extends keyof CssVariables>(
  name: V,
  value: CssVariables[V]
): CSSObject {
  return {
    [`--deci-${name}`]: value,
  };
}
