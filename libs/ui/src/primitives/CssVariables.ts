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
}
