import {
  black,
  blue100,
  blue200,
  blue300,
  blue500,
  blue700,
  brand100,
  brand200,
  brand500,
  brand600,
  dark100,
  dark200,
  dark300,
  dark400,
  dark500,
  dark600,
  dark700,
  grey100,
  grey200,
  grey500,
  grey600,
  grey700,
  offBlack,
  offWhite,
  orange100,
  orange300,
  orange500,
  orange600,
  orange700,
  purple200,
  purple300,
  purple500,
  purple600,
  purple700,
  purple800,
  red100,
  red300,
  red50,
  red500,
  red700,
  teal200,
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

  borderColor: dark500.rgb,
  borderHighlightColor: purple700.rgb,
  borderTable: dark500.rgb,

  notebookStateDangerLight: red300.rgb,
  notebookStateDangerHeavy: red100.rgb,

  notebookStateWarningLight: orange300.rgb,
  notebookStateWarningHeavy: orange100.rgb,

  notebookStateOkLight: brand600.rgb,
  notebookStateOkHeavy: brand100.rgb,

  notebookStateDisabledLight: grey600.rgb,
  notebookStateDisabledHeavy: grey100.rgb,

  backgroundColor: dark700.rgb,
  tintedBackgroundColor: grey700.rgb,
  iconBackgroundColor: grey500.rgb,
  offColor: grey600.rgb,
  spoilerColor: offWhite.rgb,

  highlightColor: dark600.rgb,
  strongHighlightColor: dark500.rgb,
  strongerHighlightColor: dark400.rgb,
  evenStrongerHighlightColor: dark300.rgb,

  weakerTextColor: dark400.rgb,
  weakTextColor: dark300.rgb,
  normalTextColor: dark200.rgb,
  strongTextColor: white.rgb,

  iconColorDark: offBlack.rgb,
  iconColorLight: offWhite.rgb,

  tooltipBackground: dark300.rgb,

  // slash icons
  weakerSlashIconColor: blue100.rgb,
  weakSlashIconColor: blue200.rgb,
  strongSlashIconColor: blue500.rgb,

  buttonPrimaryText: dark700.rgb,
  buttonPrimaryBackground: dark400.rgb,
  buttonPrimaryHover: dark500.rgb,
  buttonPrimaryDisabledText: dark700.rgb,
  buttonPrimaryDisabledBackground: grey200.rgb,

  buttonSecondaryText: dark300.rgb,
  buttonSecondaryBackground: dark500.rgb,
  buttonSecondaryHover: black.rgb,
  buttonSecondaryDisabledText: dark500.rgb,
  buttonSecondaryDisabledBackground: dark600.rgb,

  buttonBrandText: offBlack.rgb,
  buttonBrandBackground: purple300.rgb,
  buttonBrandHover: purple500.rgb,
  buttonBrandDisabledText: purple300.rgb,
  buttonBrandDisabledBackground: purple600.rgb,

  // dropline
  droplineColor: blue300.rgb,

  errorBlockColor: red50.rgb,
  errorBlockWarning: orange700.rgb,
  errorBlockError: red700.rgb,

  errorPageGradientEnd: dark500.rgb,

  bubbleColor: teal200.rgb,
  bubbleBackground: teal800.rgb,

  mutationAnimationColor: yellow700.rgb,

  currentTextColor: cssVar('normalTextColor'),

  variableHighlightColor: teal800.rgb,
  variableHighlightTextColor: dark100.rgb,

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
