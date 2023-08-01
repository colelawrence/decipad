import {
  black,
  brand100,
  brand300,
  brand700,
  grey100,
  grey200,
  grey300,
  grey400,
  grey50,
  grey500,
  grey600,
  grey700,
  offBlack,
  red200,
  red500,
  red700,
  teal100,
  teal200,
  teal600,
  teal800,
  white,
  yellow200,
  yellow600,
  yellow700,
} from '../color';
import { CssVariables } from '../CssVariables';

export const theme: CssVariables = {
  theme: 'light',

  textDisabled: grey400.hex,
  textSubdued: grey500.hex,
  textDefault: grey600.hex,
  textHeavy: grey700.hex,
  textTitle: black.hex,

  backgroundAccent: grey100.hex,
  backgroundMain: white.hex,
  backgroundSubdued: grey50.hex,
  backgroundDefault: grey100.hex,
  backgroundHeavy: grey200.hex,

  borderSubdued: grey200.hex,
  borderDefault: grey300.hex,

  iconBackground: grey200.hex,
  iconColorMain: white.hex,
  iconColorSubdued: grey200.hex,
  iconColorDefault: grey400.hex,
  iconColorHeavy: grey600.hex,

  themeTextSubdued: teal600.hex,
  themeTextDefault: teal800.hex,
  themeBackgroundSubdued: teal100.hex,
  themeBackgroundDefault: teal100.hex,
  themeBackgroundHeavy: teal200.hex,

  stateDangerBackground: red500.hex,
  stateDangerText: white.hex,
  stateDangerIconBackground: red200.hex,
  stateDangerIconOutline: red700.hex,

  stateWarningBackground: yellow600.hex,
  stateWarningText: offBlack.hex,
  stateWarningIconBackground: yellow200.hex,
  stateWarningIconOutline: yellow700.hex,

  stateOkBackground: brand300.hex,
  stateOkText: offBlack.hex,
  stateOkIconBackground: brand100.hex,
  stateOkIconOutline: brand700.hex,

  stateNeutralBackground: offBlack.hex,
  stateNeutralText: white.hex,
  stateNeutralIconBackground: grey200.hex,
  stateNeutralIconOutline: grey600.hex,

  editorWidth: '100vw',
};
