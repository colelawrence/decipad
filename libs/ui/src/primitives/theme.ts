import { brand500 } from '.';
import {
  black,
  grey100,
  grey200,
  grey500,
  grey600,
  orange500,
  red500,
  white,
} from './color';
import { cssVar, CssVariableKey, CssVariables, setCssVar } from './var';

export const darkTheme: Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
> = {
  ...setCssVar('brandColor', brand500.rgb),
  ...setCssVar('successColor', cssVar('brandColor')),
  ...setCssVar('dangerColor', red500.rgb),
  ...setCssVar('warningColor', orange500.rgb),

  ...setCssVar('backgroundColor', black.rgb),
  ...setCssVar('iconBackgroundColor', grey500.rgb),
  ...setCssVar('offColor', grey600.rgb),

  ...setCssVar('highlightColor', grey600.rgb),
  ...setCssVar('strongHighlightColor', grey500.rgb),

  ...setCssVar('weakTextColor', grey200.rgb),
  ...setCssVar('normalTextColor', grey100.rgb),
  ...setCssVar('strongTextColor', white.rgb),

  ...setCssVar('currentTextColor', cssVar('normalTextColor')),
  ...setCssVar('currentBackgroundColor', cssVar('backgroundColor')),
};
