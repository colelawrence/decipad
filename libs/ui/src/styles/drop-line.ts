import { css } from '@emotion/react';
import { componentCssVars } from '../primitives';

export const dropLineThickness = 2;

export const dropLineCommonStyles = css({
  backgroundColor: componentCssVars('DropLineColor'),
  zIndex: 1,
});
