import {
  blue100,
  blue200,
  blue300,
  blue500,
  blue700,
  brand100,
  brand200,
  brand500,
  brand600,
  grey100,
  grey200,
  grey300,
  grey400,
  grey500,
  grey600,
  grey700,
  offBlack,
  orange100,
  orange300,
  orange500,
  orange600,
  orange700,
  purple200,
  purple800,
  red100,
  red300,
  red50,
  red500,
  red700,
  teal200,
  teal500,
  teal800,
  white,
  yellow200,
  yellow300,
  yellow500,
  yellow700,
} from '../color';
import { cssVar, CssVariables } from '../var';

export const theme: CssVariables = {
  theme: 'dark',
  toastOk: brand500.rgb,
  toastDanger: red500.rgb,
  toastWarning: yellow500.rgb,

  cellDateSelected: brand500.rgb,

  errorColor: red500.rgb,

  notebookStateDangerLight: red300.rgb,
  notebookStateDangerHeavy: red100.rgb,

  notebookStateWarningLight: orange300.rgb,
  notebookStateWarningHeavy: orange100.rgb,

  notebookStateOkLight: brand600.rgb,
  notebookStateOkHeavy: brand100.rgb,

  notebookStateDisabledLight: grey600.rgb,
  notebookStateDisabledHeavy: grey100.rgb,

  backgroundColor: offBlack.rgb,
  tintedBackgroundColor: grey700.rgb,
  iconBackgroundColor: grey500.rgb,
  offColor: grey600.rgb,

  highlightColor: grey600.rgb,
  strongHighlightColor: grey500.rgb,
  strongerHighlightColor: grey400.rgb,

  weakerTextColor: grey300.rgb,
  weakTextColor: grey200.rgb,
  normalTextColor: grey100.rgb,
  strongTextColor: white.rgb,

  iconColorDark: offBlack.rgb,

  // slash icons
  weakerSlashIconColor: blue100.rgb,
  weakSlashIconColor: blue200.rgb,
  strongSlashIconColor: blue500.rgb,

  // dropline
  droplineColor: blue300.rgb,

  errorBlockColor: red50.rgb,
  errorBlockWarning: orange700.rgb,
  errorBlockError: red700.rgb,

  errorPageGradientEnd: teal800.rgb,

  bubbleColor: teal200.rgb,
  bubbleBackground: teal800.rgb,

  mutationAnimationColor: yellow700.rgb,

  currentTextColor: cssVar('normalTextColor'),

  variableHighlightColor: brand100.rgb,
  variableHighlightTextColor: teal500.rgb,

  magicNumberTextColor: brand200.rgb,

  tableSelectionBackgroundColor: blue700.rgb,
  tableFocusColor: blue500.rgb,

  liveDataBackgroundColor: purple800.rgb,
  liveDataTextColor: purple200.rgb,

  liveDataIconStrokeColor: yellow500.rgb,
  liveDataIconBgColor: yellow200.rgb,
  liveDataIconDarkStrokeColor: yellow700.rgb,
  liveDataIconAccentColor: yellow300.rgb,

  importDataIconStrokeColor: orange500.rgb,
  importDataIconBgColor: orange100.rgb,
  importDataIconDarkStrokeColor: orange600.rgb,
  importDataIconAccentColor: orange300.rgb,
};
