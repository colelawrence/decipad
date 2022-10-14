import {
  blue500,
  blue700,
  brand100,
  brand500,
  grey100,
  grey200,
  grey300,
  grey400,
  grey500,
  grey600,
  grey700,
  offBlack,
  orange700,
  purple200,
  red50,
  red500,
  red700,
  teal200,
  teal500,
  teal800,
  white,
  yellow500,
  yellow700,
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
  ...setCssVar('tintedBackgroundColor', grey700.rgb),
  ...setCssVar('iconBackgroundColor', grey500.rgb),
  ...setCssVar('offColor', grey600.rgb),

  ...setCssVar('highlightColor', grey600.rgb),
  ...setCssVar('strongHighlightColor', grey500.rgb),
  ...setCssVar('strongerHighlightColor', grey400.rgb),

  ...setCssVar('weakerTextColor', grey300.rgb),
  ...setCssVar('weakTextColor', grey200.rgb),
  ...setCssVar('normalTextColor', grey100.rgb),
  ...setCssVar('strongTextColor', white.rgb),

  ...setCssVar('iconColorDark', offBlack.rgb),

  ...setCssVar('errorDialogColor', red50.rgb),
  ...setCssVar('errorDialogWarning', orange700.rgb),
  ...setCssVar('errorDialogError', red700.rgb),

  ...setCssVar('bubbleColor', teal200.rgb),
  ...setCssVar('bubbleBackground', teal800.rgb),

  ...setCssVar('mutationAnimationColor', yellow700.rgb),

  ...setCssVar('currentTextColor', cssVar('normalTextColor')),

  ...setCssVar('variableHighlightColor', brand100.rgb),
  ...setCssVar('variableHighlightTextColor', teal500.rgb),

  ...setCssVar('tableSelectionBackgroundColor', blue700.rgb),

  ...setCssVar('liveDataBackgroundColor', purple200.rgb),
  ...setCssVar('tableFocusColor', blue500.rgb),
  ...setCssVar('liveDataBackgroundColor', purple200.rgb),
};
