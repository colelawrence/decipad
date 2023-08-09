import {
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
  dark800,
  offBlack,
  red600,
  red700,
  red800,
  teal200,
  teal500,
  teal700,
  teal800,
  white,
  yellow600,
  yellow700,
  yellow800,
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

  stateDangerBackground: red700.hex,
  stateDangerText: white.hex,
  stateDangerIconBackground: red600.hex,
  stateDangerIconOutline: red800.hex,

  stateWarningBackground: yellow700.hex,
  stateWarningText: offBlack.hex,
  stateWarningIconBackground: yellow600.hex,
  stateWarningIconOutline: yellow800.hex,

  stateOkBackground: brand700.hex,
  stateOkText: offBlack.hex,
  stateOkIconBackground: brand600.hex,
  stateOkIconOutline: brand800.hex,

  stateNeutralBackground: dark500.hex,
  stateNeutralText: white.hex,
  stateNeutralIconBackground: dark400.hex,
  stateNeutralIconOutline: dark600.hex,

  editorWidth: '100vw',
};
