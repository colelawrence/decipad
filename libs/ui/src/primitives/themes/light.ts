import {
  blue100,
  blue200,
  blue300,
  blue500,
  brand200,
  brand300,
  brand400,
  brand500,
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
  orange500,
  orange600,
  orange700,
  red100,
  red300,
  red50,
  red500,
  teal200,
  teal600,
  teal800,
  white,
  yellow200,
  yellow300,
  yellow400,
  yellow500,
  yellow600,
  yellow700,
  yellow800,
} from '../color';
import { cssVar, CssVariables } from '../var';

export const theme: CssVariables = {
  theme: 'light',
  toastOk: brand300.hex,
  toastDanger: red500.hex,
  toastWarning: yellow600.hex,

  cellDateSelected: brand300.hex,

  errorColor: red500.hex,

  borderColor: grey200.hex,
  borderHighlightColor: grey300.hex,
  borderTable: grey200.hex,

  notebookStateDangerLight: red100.hex,
  notebookStateDangerHeavy: red300.hex,
  notebookStateWarningLight: orange100.hex,
  notebookStateWarningHeavy: orange500.hex,
  notebookStateOkLight: brand200.hex,
  notebookStateOkHeavy: brand600.hex,
  notebookStateDisabledLight: grey100.hex,
  notebookStateDisabledHeavy: grey600.hex,

  backgroundColor: white.hex,
  tintedBackgroundColor: grey50.hex,
  iconBackgroundColor: grey200.hex,
  offColor: offWhite.hex,
  spoilerColor: offBlack.hex,

  highlightColor: grey100.hex,
  strongHighlightColor: grey200.hex,
  strongerHighlightColor: grey300.hex,
  evenStrongerHighlightColor: grey400.hex,

  weakerTextColor: grey400.hex,
  weakTextColor: grey500.hex,
  normalTextColor: grey600.hex,
  strongTextColor: offBlack.hex,

  iconColorDark: offBlack.hex,
  iconColorLight: offWhite.hex,

  tooltipBackground: offBlack.hex,

  // slash icons
  weakerSlashIconColor: blue100.hex,
  weakSlashIconColor: blue200.hex,
  strongSlashIconColor: blue500.hex,

  // buttons
  buttonPrimaryText: white.hex,
  buttonPrimaryBackground: offBlack.hex,
  buttonPrimaryHover: grey600.hex,
  buttonPrimaryDisabledText: grey500.hex,
  buttonPrimaryDisabledBackground: offBlack.hex,

  buttonBrandText: offBlack.hex,
  buttonBrandBackground: brand500.hex,
  buttonBrandHover: brand300.hex,
  buttonBrandDisabledText: brand500.hex,
  buttonBrandDisabledBackground: brand200.hex,

  buttonSecondaryText: offBlack.hex,
  buttonSecondaryBackground: grey300.hex,
  buttonSecondaryHover: grey200.hex,
  buttonSecondaryDisabledText: grey500.hex,
  buttonSecondaryDisabledBackground: grey200.hex,

  // hover ui buttons
  buttonHoverBackground: grey200.hex,
  buttonHoverBackgroundHover: grey300.hex,

  // dropline
  droplineColor: blue300.hex,
  droplineGreyColor: grey300.hex,

  errorBlockColor: orange700.hex,
  errorBlockWarning: orange50.hex,
  errorBlockError: red50.hex,

  errorPageGradientEnd: grey200.hex,

  bubbleColor: teal800.hex,
  bubbleBackground: teal200.hex,

  mutationAnimationColor: yellow200.hex,

  get currentTextColor() {
    return cssVar('normalTextColor');
  },

  variableHighlightColor: grey200.hex,
  variableHighlightTextColor: teal600.hex,

  structuredCalculationVariableColor: teal200.hex,
  structuredCalculationSimpleColor: brand400.hex,

  magicNumberTextColor: teal600.hex,

  tableSelectionBackgroundColor: blue100.hex,
  tableFocusColor: blue300.hex,

  liveDataBackgroundColor: yellow400.hex,
  liveDataTextColor: yellow800.hex,

  liveDataIconStrokeColor: yellow500.hex,
  liveDataIconBgColor: yellow200.hex,
  liveDataIconDarkStrokeColor: yellow700.hex,
  liveDataIconAccentColor: yellow300.hex,

  importDataIconStrokeColor: orange500.hex,
  importDataIconBgColor: orange100.hex,
  importDataIconDarkStrokeColor: orange600.hex,
  importDataIconAccentColor: orange300.hex,
};
