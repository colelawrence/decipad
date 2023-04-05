import { CssVariables } from './CssVariables';
import { theme as lightTheme } from './themes/light';

const defaults: CssVariables = lightTheme;

const cssVariablePrefix = '--deci-';
export type CssVariableKey<V extends keyof CssVariables> =
  `${typeof cssVariablePrefix}${V}`;

export function cssVarHex<V extends keyof CssVariables>(name: V) {
  return defaults[name];
}

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
