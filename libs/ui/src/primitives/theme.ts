import { electricGreen200 } from '.';
import {
  black,
  grey100,
  grey200,
  grey300,
  grey400,
  orange500,
  red500,
  white,
} from './color';
import { cssVar, CssVariableKey, CssVariables, setCssVar } from './var';

export const darkTheme: Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
> = {
  ...setCssVar('brandColor', electricGreen200.rgb),
  ...setCssVar('successColor', cssVar('brandColor')),
  ...setCssVar('dangerColor', red500.rgb),
  ...setCssVar('warningColor', orange500.rgb),

  ...setCssVar('backgroundColor', black.rgb),
  ...setCssVar('iconBackgroundColor', grey300.rgb),
  ...setCssVar('offColor', grey400.rgb),

  ...setCssVar('highlightColor', grey400.rgb),
  ...setCssVar('strongHighlightColor', grey300.rgb),

  ...setCssVar('weakTextColor', grey200.rgb),
  ...setCssVar('normalTextColor', grey100.rgb),
  ...setCssVar('strongTextColor', white.rgb),

  ...setCssVar('currentTextColor', cssVar('normalTextColor')),
};
