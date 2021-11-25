import { black, grey300, grey400, grey200, grey100, white } from './color';
import { cssVar, CssVariableKey, CssVariables, setCssVar } from './var';

export const darkTheme: Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
> = {
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
