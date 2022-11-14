import {
  blue100,
  blue200,
  blue300,
  blue500,
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
} from '../color';
import { cssVar, CssVariables } from '../var';

export const theme: CssVariables = {
  theme: 'light',
  toastOk: brand300.rgb,
  toastDanger: red500.rgb,
  toastWarning: yellow600.rgb,

  cellDateSelected: brand300.rgb,

  errorColor: red500.rgb,

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

  // slash icons
  weakerSlashIconColor: blue100.rgb,
  weakSlashIconColor: blue200.rgb,
  strongSlashIconColor: blue500.rgb,

  // dropline
  droplineColor: blue300.rgb,

  errorBlockColor: orange700.rgb,
  errorBlockWarning: orange50.rgb,
  errorBlockError: red50.rgb,

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
