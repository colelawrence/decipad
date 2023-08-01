import {
  brand100,
  brand300,
  brand700,
  dark100,
  dark200,
  dark300,
  dark400,
  dark500,
  dark600,
  dark700,
  dark800,
  grey200,
  grey600,
  offBlack,
  red200,
  red500,
  red700,
  teal200,
  teal500,
  teal700,
  teal800,
  white,
  yellow200,
  yellow600,
  yellow700,
} from '../color';
import { CssVariables } from '../CssVariables';

export const theme: CssVariables = {
  theme: 'dark',

  textDisabled: dark100.hex,
  textSubdued: dark200.hex,
  textDefault: dark300.hex,
  textHeavy: dark200.hex,
  textTitle: dark200.hex,

  backgroundAccent: dark800.hex,
  backgroundMain: dark700.hex,
  backgroundSubdued: dark600.hex,
  backgroundDefault: dark600.hex,
  backgroundHeavy: dark600.hex,

  borderSubdued: dark500.hex,
  borderDefault: dark500.hex,

  iconBackground: dark600.hex,
  iconColorMain: dark700.hex,
  iconColorSubdued: dark600.hex,
  iconColorDefault: dark500.hex,
  iconColorHeavy: dark400.hex,

  themeTextSubdued: teal500.hex,
  themeTextDefault: teal200.hex,
  themeBackgroundSubdued: teal800.hex,
  themeBackgroundDefault: teal800.hex,
  themeBackgroundHeavy: teal700.hex,

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
