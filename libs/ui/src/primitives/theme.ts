import {
  brand500,
  grey100,
  grey200,
  grey300,
  grey400,
  grey500,
  grey600,
  offBlack,
  red500,
  white,
  orange100,
  yellow500,
} from './color';
import { cssVar, CssVariableKey, CssVariables, setCssVar } from './var';

export const darkTheme: Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
> = {
  ...setCssVar('successColor', brand500.rgb),
  ...setCssVar('dangerColor', red500.rgb),
  ...setCssVar('warningColor', yellow500.rgb),

  ...setCssVar('backgroundColor', offBlack.rgb),
  ...setCssVar('iconBackgroundColor', grey500.rgb),
  ...setCssVar('offColor', grey600.rgb),

  ...setCssVar('highlightColor', grey600.rgb),
  ...setCssVar('strongHighlightColor', grey500.rgb),
  ...setCssVar('strongerHighlightColor', grey400.rgb),

  ...setCssVar('weakerTextColor', grey300.rgb),
  ...setCssVar('weakTextColor', grey200.rgb),
  ...setCssVar('normalTextColor', grey100.rgb),
  ...setCssVar('strongTextColor', white.rgb),

  ...setCssVar('currentTextColor', cssVar('normalTextColor')),

  ...setCssVar('missingVariableHighlightColor', orange100.rgb),
};
