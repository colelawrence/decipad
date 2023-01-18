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
  brand700,
  brand800,
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
  red600,
  red700,
  teal200,
  teal800,
  white,
  yellow200,
  yellow300,
  yellow400,
  yellow500,
  yellow700,
} from '../color';
import { cssVar, CssVariables } from '../var';

export const theme: CssVariables = {
  theme: 'dark',
  toastOk: brand700.hex,
  toastDanger: red600.hex,
  toastWarning: yellow700.hex,

  cellDateSelected: brand500.hex,

  errorColor: red500.hex,

  borderColor: dark500.hex,
  borderHighlightColor: purple700.hex,
  borderTable: dark500.hex,

  notebookStateDangerLight: red300.hex,
  notebookStateDangerHeavy: red100.hex,

  notebookStateWarningLight: orange300.hex,
  notebookStateWarningHeavy: orange100.hex,

  notebookStateOkLight: brand600.hex,
  notebookStateOkHeavy: brand100.hex,

  notebookStateDisabledLight: grey600.hex,
  notebookStateDisabledHeavy: grey100.hex,

  backgroundColor: dark700.hex,
  tintedBackgroundColor: grey700.hex,
  iconBackgroundColor: grey500.hex,
  offColor: grey600.hex,
  spoilerColor: offWhite.hex,

  highlightColor: dark600.hex,
  strongHighlightColor: dark500.hex,
  strongerHighlightColor: dark400.hex,
  evenStrongerHighlightColor: dark300.hex,

  weakerTextColor: dark400.hex,
  weakTextColor: dark300.hex,
  normalTextColor: dark200.hex,
  strongTextColor: white.hex,

  iconColorDark: offBlack.hex,
  iconColorLight: offWhite.hex,

  tooltipBackground: dark300.hex,

  // slash icons
  weakerSlashIconColor: blue100.hex,
  weakSlashIconColor: blue200.hex,
  strongSlashIconColor: blue500.hex,

  buttonPrimaryText: dark700.hex,
  buttonPrimaryBackground: dark400.hex,
  buttonPrimaryHover: dark500.hex,
  buttonPrimaryDisabledText: dark700.hex,
  buttonPrimaryDisabledBackground: grey200.hex,

  buttonSecondaryText: dark300.hex,
  buttonSecondaryBackground: dark500.hex,
  buttonSecondaryHover: black.hex,
  buttonSecondaryDisabledText: dark500.hex,
  buttonSecondaryDisabledBackground: dark600.hex,

  buttonBrandText: offBlack.hex,
  buttonBrandBackground: purple300.hex,
  buttonBrandHover: purple500.hex,
  buttonBrandDisabledText: purple300.hex,
  buttonBrandDisabledBackground: purple600.hex,

  // dropline
  droplineColor: blue300.hex,
  droplineGreyColor: purple600.hex,

  errorBlockColor: red50.hex,
  errorBlockWarning: orange700.hex,
  errorBlockError: red700.hex,

  errorPageGradientEnd: dark500.hex,

  bubbleColor: teal200.hex,
  bubbleBackground: teal800.hex,

  mutationAnimationColor: yellow700.hex,

  currentTextColor: cssVar('normalTextColor'),

  structuredCalculationSimpleColor: brand800.hex,
  structuredCalculationVariableColor: yellow400.hex,

  variableHighlightColor: teal800.hex,
  variableHighlightTextColor: dark100.hex,

  magicNumberTextColor: brand200.hex,

  tableSelectionBackgroundColor: blue700.hex,
  tableFocusColor: blue500.hex,

  liveDataBackgroundColor: purple800.hex,
  liveDataTextColor: purple200.hex,

  liveDataIconStrokeColor: yellow500.hex,
  liveDataIconBgColor: yellow200.hex,
  liveDataIconDarkStrokeColor: yellow700.hex,
  liveDataIconAccentColor: yellow300.hex,

  importDataIconStrokeColor: orange500.hex,
  importDataIconBgColor: orange100.hex,
  importDataIconDarkStrokeColor: orange600.hex,
  importDataIconAccentColor: orange300.hex,
};
