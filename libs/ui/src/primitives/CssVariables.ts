import { Property } from 'csstype';

export interface CssVariables {
  // Enum for current theme
  readonly theme: 'light' | 'dark';

  //
  // Toast
  //
  readonly toastOk: Property.Color;
  readonly toastDanger: Property.Color;
  readonly toastWarning: Property.Color;

  //
  // Tables
  //
  readonly cellDateSelected: Property.Color;
  readonly tableFocusColor: Property.Color;
  readonly tableSelectionBackgroundColor: Property.Color;
  readonly liveDataBackgroundColor: Property.Color;
  readonly liveDataTextColor: Property.Color;

  //
  // Live Data Icons
  //
  readonly liveDataIconStrokeColor: Property.Color;
  readonly liveDataIconAccentColor: Property.Color;
  readonly liveDataIconDarkStrokeColor: Property.Color;
  readonly liveDataIconBgColor: Property.Color;

  readonly importDataIconStrokeColor: Property.Color;
  readonly importDataIconAccentColor: Property.Color;
  readonly importDataIconDarkStrokeColor: Property.Color;
  readonly importDataIconBgColor: Property.Color;

  //
  // Errors
  //
  readonly errorColor: Property.Color;
  readonly errorBlockColor: Property.Color;
  readonly errorBlockWarning: Property.Color;
  readonly errorBlockError: Property.Color;

  //
  // Pages
  //
  readonly errorPageGradientEnd: Property.Color;

  //
  // Drag&Drop: Dropline
  //
  readonly droplineColor: Property.Color;
  readonly droplineGreyColor: Property.Color;

  //
  // Notebook state
  //
  readonly notebookStateDangerLight: Property.Color;
  readonly notebookStateDangerHeavy: Property.Color;
  readonly notebookStateWarningLight: Property.Color;
  readonly notebookStateWarningHeavy: Property.Color;
  readonly notebookStateOkLight: Property.Color;
  readonly notebookStateOkHeavy: Property.Color;
  readonly notebookStateDisabledLight: Property.Color;
  readonly notebookStateDisabledHeavy: Property.Color;

  //
  // Icons
  //
  readonly weakerSlashIconColor: Property.Color;
  readonly weakSlashIconColor: Property.Color;
  readonly strongSlashIconColor: Property.Color;
  readonly iconBackgroundColor: Property.Color;
  readonly iconColorDark: Property.Color;
  readonly iconColorLight: Property.Color;
  readonly tooltipBackground: Property.Color;
  readonly tooltipCodeBackground: Property.Color;

  //
  // Buttons
  //
  readonly buttonPrimaryText: Property.Color;
  readonly buttonPrimaryBackground: Property.Color;
  readonly buttonPrimaryHover: Property.Color;
  readonly buttonPrimaryDisabledText: Property.Color;
  readonly buttonPrimaryDisabledBackground: Property.Color;

  readonly buttonSecondaryText: Property.Color;
  readonly buttonSecondaryBackground: Property.Color;
  readonly buttonSecondaryHover: Property.Color;
  readonly buttonSecondaryDisabledText: Property.Color;
  readonly buttonSecondaryDisabledBackground: Property.Color;

  readonly buttonBrandText: Property.Color;
  readonly buttonBrandBackground: Property.Color;
  readonly buttonBrandHover: Property.Color;
  readonly buttonBrandDisabledText: Property.Color;
  readonly buttonBrandDisabledBackground: Property.Color;

  //
  // Numbers & Bubbles
  //
  readonly magicNumberTextColor: Property.Color;
  readonly bubbleColor: Property.Color;
  readonly bubbleBackground: Property.Color;
  readonly variableHighlightTextColor: Property.Color;
  readonly variableHighlightColor: Property.Color;

  readonly structuredCalculationSimpleColor: Property.Color;
  readonly structuredCalculationVariableColor: Property.Color;

  //
  // UI
  //
  readonly mutationAnimationColor: Property.Color;
  readonly offColor: Property.Color;
  readonly spoilerColor: Property.Color;
  readonly borderColor: Property.Color;
  readonly borderHighlightColor: Property.Color;
  readonly borderTable: Property.Color;

  //
  // Hover UI Buttons
  //
  readonly buttonHoverBackground: Property.Color;
  readonly buttonHoverBackgroundHover: Property.Color;

  //
  // Background
  //
  readonly backgroundColor: Property.Color;
  readonly tintedBackgroundColor: Property.Color;

  //
  // Highlights
  //
  readonly highlightColor: Property.Color;
  readonly strongHighlightColor: Property.Color;
  readonly strongerHighlightColor: Property.Color;
  readonly evenStrongerHighlightColor: Property.Color;

  //
  // Text
  //
  readonly weakerTextColor: Property.Color;
  readonly weakTextColor: Property.Color;
  readonly normalTextColor: Property.Color;
  readonly strongTextColor: Property.Color;

  //
  // Change text color
  //
  readonly currentTextColor: Property.Color;

  readonly formulaUnitBackground: Property.Color;

  readonly chartThemeMulticolorPurple1: Property.Color;
  readonly chartThemeMulticolorPurple2: Property.Color;
  readonly chartThemeMulticolorPurple3: Property.Color;
  readonly chartThemeMulticolorPurple4: Property.Color;
  readonly chartThemeMulticolorPurple5: Property.Color;
  readonly chartThemeMulticolorPurple6: Property.Color;
  readonly chartThemeMulticolorPurple7: Property.Color;
  readonly chartThemeMulticolorPurple8: Property.Color;
  readonly chartThemeMulticolorPurple9: Property.Color;
  readonly chartThemeMulticolorPurple10: Property.Color;
  readonly chartThemeMulticolorPurple11: Property.Color;

  readonly chartThemeMulticolorRed1: Property.Color;
  readonly chartThemeMulticolorRed2: Property.Color;
  readonly chartThemeMulticolorRed3: Property.Color;
  readonly chartThemeMulticolorRed4: Property.Color;
  readonly chartThemeMulticolorRed5: Property.Color;
  readonly chartThemeMulticolorRed6: Property.Color;
  readonly chartThemeMulticolorRed7: Property.Color;
  readonly chartThemeMulticolorRed8: Property.Color;
  readonly chartThemeMulticolorRed9: Property.Color;
  readonly chartThemeMulticolorRed10: Property.Color;
  readonly chartThemeMulticolorRed11: Property.Color;

  readonly chartThemeMulticolorGrey1: Property.Color;
  readonly chartThemeMulticolorGrey2: Property.Color;
  readonly chartThemeMulticolorGrey3: Property.Color;
  readonly chartThemeMulticolorGrey4: Property.Color;
  readonly chartThemeMulticolorGrey5: Property.Color;
  readonly chartThemeMulticolorGrey6: Property.Color;
  readonly chartThemeMulticolorGrey7: Property.Color;
  readonly chartThemeMulticolorGrey8: Property.Color;
  readonly chartThemeMulticolorGrey9: Property.Color;
  readonly chartThemeMulticolorGrey10: Property.Color;
  readonly chartThemeMulticolorGrey11: Property.Color;

  readonly chartThemeMulticolorYellow1: Property.Color;
  readonly chartThemeMulticolorYellow2: Property.Color;
  readonly chartThemeMulticolorYellow3: Property.Color;
  readonly chartThemeMulticolorYellow4: Property.Color;
  readonly chartThemeMulticolorYellow5: Property.Color;
  readonly chartThemeMulticolorYellow6: Property.Color;
  readonly chartThemeMulticolorYellow7: Property.Color;
  readonly chartThemeMulticolorYellow8: Property.Color;
  readonly chartThemeMulticolorYellow9: Property.Color;
  readonly chartThemeMulticolorYellow10: Property.Color;
  readonly chartThemeMulticolorYellow11: Property.Color;

  readonly chartThemeMulticolorBlue1: Property.Color;
  readonly chartThemeMulticolorBlue2: Property.Color;
  readonly chartThemeMulticolorBlue3: Property.Color;
  readonly chartThemeMulticolorBlue4: Property.Color;
  readonly chartThemeMulticolorBlue5: Property.Color;
  readonly chartThemeMulticolorBlue6: Property.Color;
  readonly chartThemeMulticolorBlue7: Property.Color;
  readonly chartThemeMulticolorBlue8: Property.Color;
  readonly chartThemeMulticolorBlue9: Property.Color;
  readonly chartThemeMulticolorBlue10: Property.Color;
  readonly chartThemeMulticolorBlue11: Property.Color;

  readonly chartThemeMulticolorGreen1: Property.Color;
  readonly chartThemeMulticolorGreen2: Property.Color;
  readonly chartThemeMulticolorGreen3: Property.Color;
  readonly chartThemeMulticolorGreen4: Property.Color;
  readonly chartThemeMulticolorGreen5: Property.Color;
  readonly chartThemeMulticolorGreen6: Property.Color;
  readonly chartThemeMulticolorGreen7: Property.Color;
  readonly chartThemeMulticolorGreen8: Property.Color;
  readonly chartThemeMulticolorGreen9: Property.Color;
  readonly chartThemeMulticolorGreen10: Property.Color;
  readonly chartThemeMulticolorGreen11: Property.Color;

  readonly chartThemeMulticolorOrange1: Property.Color;
  readonly chartThemeMulticolorOrange2: Property.Color;
  readonly chartThemeMulticolorOrange3: Property.Color;
  readonly chartThemeMulticolorOrange4: Property.Color;
  readonly chartThemeMulticolorOrange5: Property.Color;
  readonly chartThemeMulticolorOrange6: Property.Color;
  readonly chartThemeMulticolorOrange7: Property.Color;
  readonly chartThemeMulticolorOrange8: Property.Color;
  readonly chartThemeMulticolorOrange9: Property.Color;
  readonly chartThemeMulticolorOrange10: Property.Color;
  readonly chartThemeMulticolorOrange11: Property.Color;

  readonly chartThemeMonochromePurple1: Property.Color;
  readonly chartThemeMonochromePurple2: Property.Color;
  readonly chartThemeMonochromePurple3: Property.Color;
  readonly chartThemeMonochromePurple4: Property.Color;
  readonly chartThemeMonochromePurple5: Property.Color;
  readonly chartThemeMonochromePurple6: Property.Color;
  readonly chartThemeMonochromePurple7: Property.Color;
  readonly chartThemeMonochromePurple8: Property.Color;
  readonly chartThemeMonochromePurple9: Property.Color;
  readonly chartThemeMonochromePurple10: Property.Color;
  readonly chartThemeMonochromePurple11: Property.Color;

  readonly chartThemeMonochromeRed1: Property.Color;
  readonly chartThemeMonochromeRed2: Property.Color;
  readonly chartThemeMonochromeRed3: Property.Color;
  readonly chartThemeMonochromeRed4: Property.Color;
  readonly chartThemeMonochromeRed5: Property.Color;
  readonly chartThemeMonochromeRed6: Property.Color;
  readonly chartThemeMonochromeRed7: Property.Color;
  readonly chartThemeMonochromeRed8: Property.Color;
  readonly chartThemeMonochromeRed9: Property.Color;
  readonly chartThemeMonochromeRed10: Property.Color;
  readonly chartThemeMonochromeRed11: Property.Color;

  readonly chartThemeMonochromeGrey1: Property.Color;
  readonly chartThemeMonochromeGrey2: Property.Color;
  readonly chartThemeMonochromeGrey3: Property.Color;
  readonly chartThemeMonochromeGrey4: Property.Color;
  readonly chartThemeMonochromeGrey5: Property.Color;
  readonly chartThemeMonochromeGrey6: Property.Color;
  readonly chartThemeMonochromeGrey7: Property.Color;
  readonly chartThemeMonochromeGrey8: Property.Color;
  readonly chartThemeMonochromeGrey9: Property.Color;
  readonly chartThemeMonochromeGrey10: Property.Color;
  readonly chartThemeMonochromeGrey11: Property.Color;

  readonly chartThemeMonochromeYellow1: Property.Color;
  readonly chartThemeMonochromeYellow2: Property.Color;
  readonly chartThemeMonochromeYellow3: Property.Color;
  readonly chartThemeMonochromeYellow4: Property.Color;
  readonly chartThemeMonochromeYellow5: Property.Color;
  readonly chartThemeMonochromeYellow6: Property.Color;
  readonly chartThemeMonochromeYellow7: Property.Color;
  readonly chartThemeMonochromeYellow8: Property.Color;
  readonly chartThemeMonochromeYellow9: Property.Color;
  readonly chartThemeMonochromeYellow10: Property.Color;
  readonly chartThemeMonochromeYellow11: Property.Color;

  readonly chartThemeMonochromeBlue1: Property.Color;
  readonly chartThemeMonochromeBlue2: Property.Color;
  readonly chartThemeMonochromeBlue3: Property.Color;
  readonly chartThemeMonochromeBlue4: Property.Color;
  readonly chartThemeMonochromeBlue5: Property.Color;
  readonly chartThemeMonochromeBlue6: Property.Color;
  readonly chartThemeMonochromeBlue7: Property.Color;
  readonly chartThemeMonochromeBlue8: Property.Color;
  readonly chartThemeMonochromeBlue9: Property.Color;
  readonly chartThemeMonochromeBlue10: Property.Color;
  readonly chartThemeMonochromeBlue11: Property.Color;

  readonly chartThemeMonochromeGreen1: Property.Color;
  readonly chartThemeMonochromeGreen2: Property.Color;
  readonly chartThemeMonochromeGreen3: Property.Color;
  readonly chartThemeMonochromeGreen4: Property.Color;
  readonly chartThemeMonochromeGreen5: Property.Color;
  readonly chartThemeMonochromeGreen6: Property.Color;
  readonly chartThemeMonochromeGreen7: Property.Color;
  readonly chartThemeMonochromeGreen8: Property.Color;
  readonly chartThemeMonochromeGreen9: Property.Color;
  readonly chartThemeMonochromeGreen10: Property.Color;
  readonly chartThemeMonochromeGreen11: Property.Color;

  readonly chartThemeMonochromeOrange1: Property.Color;
  readonly chartThemeMonochromeOrange2: Property.Color;
  readonly chartThemeMonochromeOrange3: Property.Color;
  readonly chartThemeMonochromeOrange4: Property.Color;
  readonly chartThemeMonochromeOrange5: Property.Color;
  readonly chartThemeMonochromeOrange6: Property.Color;
  readonly chartThemeMonochromeOrange7: Property.Color;
  readonly chartThemeMonochromeOrange8: Property.Color;
  readonly chartThemeMonochromeOrange9: Property.Color;
  readonly chartThemeMonochromeOrange10: Property.Color;
  readonly chartThemeMonochromeOrange11: Property.Color;
}
