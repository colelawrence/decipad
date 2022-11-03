import type { Property } from 'csstype';
import {
  blue100,
  blue300,
  brand100,
  brand300,
  brand600,
  grey100,
  grey200,
  grey300,
  grey400,
  grey50,
  grey500,
  grey600,
  offBlack,
  offWhite,
  orange100,
  orange300,
  orange50,
  orange700,
  purple200,
  red100,
  red300,
  red50,
  red500,
  teal200,
  teal600,
  teal800,
  white,
  yellow200,
  yellow600,
} from './color';

export interface CssVariables {
  // Accent

  readonly successColor: Property.Color;
  readonly dangerColor: Property.Color;
  readonly warningColor: Property.Color;

  // States for Undo/Redo
  readonly notebookStateDangerLight: Property.Color;
  readonly notebookStateDangerHeavy: Property.Color;
  readonly notebookStateWarningLight: Property.Color;
  readonly notebookStateWarningHeavy: Property.Color;
  readonly notebookStateOkLight: Property.Color;
  readonly notebookStateOkHeavy: Property.Color;
  readonly notebookStateDisabledLight: Property.Color;
  readonly notebookStateDisabledHeavy: Property.Color;

  // Fill

  readonly backgroundColor: Property.Color;
  readonly tintedBackgroundColor: Property.Color;
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

  // dark on both modes
  readonly iconColorDark: Property.Color;

  // error dialog
  readonly errorDialogColor: Property.Color;
  readonly errorDialogWarning: Property.Color;
  readonly errorDialogError: Property.Color;

  readonly bubbleColor: Property.Color;
  readonly bubbleBackground: Property.Color;

  readonly errorPageGradientEnd: Property.Color;

  readonly mutationAnimationColor: Property.Color;

  // Code
  readonly variableHighlightTextColor: Property.Color;
  readonly variableHighlightColor: Property.Color;

  // inline text
  readonly magicNumberTextColor: Property.Color;

  // Table
  readonly tableSelectionBackgroundColor: Property.Color;
  readonly tableFocusColor: Property.Color;

  // Live data
  readonly liveDataBackgroundColor: Property.Color;
}

const defaults: CssVariables = {
  successColor: brand300.rgb,
  dangerColor: red500.rgb,
  warningColor: yellow600.rgb,

  notebookStateDangerLight: red100.rgb,
  notebookStateDangerHeavy: red300.rgb,

  notebookStateWarningLight: orange100.rgb,
  notebookStateWarningHeavy: orange300.rgb,

  notebookStateOkLight: brand100.rgb,
  notebookStateOkHeavy: brand600.rgb,

  notebookStateDisabledLight: grey100.rgb,
  notebookStateDisabledHeavy: grey600.rgb,

  backgroundColor: white.rgb,
  tintedBackgroundColor: grey50.rgb,
  iconBackgroundColor: grey200.rgb,
  offColor: offWhite.rgb,

  highlightColor: grey100.rgb,
  strongHighlightColor: grey200.rgb,
  strongerHighlightColor: grey300.rgb,

  weakerTextColor: grey400.rgb,
  weakTextColor: grey500.rgb,
  normalTextColor: grey600.rgb,
  strongTextColor: offBlack.rgb,

  iconColorDark: offBlack.rgb,

  errorDialogColor: orange700.rgb,
  errorDialogWarning: orange50.rgb,
  errorDialogError: red50.rgb,

  errorPageGradientEnd: grey200.rgb,

  bubbleColor: teal800.rgb,
  bubbleBackground: teal200.rgb,

  mutationAnimationColor: yellow200.rgb,

  get currentTextColor() {
    return cssVar('normalTextColor');
  },

  variableHighlightColor: grey200.rgb,
  variableHighlightTextColor: teal600.rgb,

  magicNumberTextColor: brand600.rgb,

  tableSelectionBackgroundColor: blue100.rgb,
  tableFocusColor: blue300.rgb,

  liveDataBackgroundColor: purple200.rgb,
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
