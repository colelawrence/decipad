import { Property } from 'csstype';

export interface CssVariables {
  // Enum for current theme
  readonly theme: 'light' | 'dark';

  // Style modifications
  readonly textDisabled: Property.Color;
  readonly textSubdued: Property.Color;
  readonly textDefault: Property.Color;
  readonly textHeavy: Property.Color;
  readonly textTitle: Property.Color;

  readonly backgroundAccent: Property.Color;
  readonly backgroundMain: Property.Color;
  readonly backgroundSubdued: Property.Color;
  readonly backgroundDefault: Property.Color;
  readonly backgroundHeavy: Property.Color;

  readonly borderSubdued: Property.Color;
  readonly borderDefault: Property.Color;

  readonly iconBackground: Property.Color;
  readonly iconColorMain: Property.Color;
  readonly iconColorSubdued: Property.Color;
  readonly iconColorDefault: Property.Color;
  readonly iconColorHeavy: Property.Color;

  readonly themeTextSubdued: Property.Color;
  readonly themeTextDefault: Property.Color;
  readonly themeBackgroundSubdued: Property.Color;
  readonly themeBackgroundDefault: Property.Color;
  readonly themeBackgroundHeavy: Property.Color;

  readonly stateDangerBackground: Property.Color;
  readonly stateDangerText: Property.Color;
  readonly stateDangerIconBackground: Property.Color;
  readonly stateDangerIconOutline: Property.Color;

  readonly stateWarningBackground: Property.Color;
  readonly stateWarningText: Property.Color;
  readonly stateWarningIconBackground: Property.Color;
  readonly stateWarningIconOutline: Property.Color;

  readonly stateOkBackground: Property.Color;
  readonly stateOkText: Property.Color;
  readonly stateOkIconBackground: Property.Color;
  readonly stateOkIconOutline: Property.Color;

  readonly stateNeutralBackground: Property.Color;
  readonly stateNeutralText: Property.Color;
  readonly stateNeutralIconBackground: Property.Color;
  readonly stateNeutralIconOutline: Property.Color;

  readonly editorWidth: string;
}
