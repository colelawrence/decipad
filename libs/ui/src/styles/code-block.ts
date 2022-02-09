import { CSSObject } from '@emotion/react';
import { code, teal600, teal50, setCssVar } from '../primitives';

export const lineHeight = '34px';

export const variableStyles: CSSObject = {
  ...code,
  ...setCssVar('currentTextColor', teal600.rgb),
  backgroundColor: teal50.rgb,
};
