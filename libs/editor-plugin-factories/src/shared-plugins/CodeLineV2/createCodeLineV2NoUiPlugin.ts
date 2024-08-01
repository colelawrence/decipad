import type { Computer } from '@decipad/computer-interfaces';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_STRUCTURED_VARNAME,
  type MyPlatePlugin,
} from '@decipad/editor-types';

import {
  createNormalizeCodeLineCodePlugin,
  createNormalizeCodeLineV2Plugin,
  createNormalizeCodeLineVarnamePlugin,
} from './normalization';

const createCodeLineRootPlugin = (_computer: Computer) => ({
  key: ELEMENT_CODE_LINE_V2,
  isElement: true,
});
const createCodeLineVarnamePlugin = (_computer: Computer) => ({
  key: ELEMENT_STRUCTURED_VARNAME,
  isElement: true,
});

export const createCodeLineV2NoUiPlugin = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'CODE_LINE_V2_ROOT',
  plugins: [
    createCodeLineRootPlugin(computer),
    createCodeLineVarnamePlugin(computer),
    createNormalizeCodeLineV2Plugin(),
    createNormalizeCodeLineCodePlugin(computer),
    createNormalizeCodeLineVarnamePlugin(),
  ],
});

export const createCodeLineV2Normalizers = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'CODE_LINE_V2_NORMALIZERS',
  plugins: [
    createNormalizeCodeLineV2Plugin(),
    createNormalizeCodeLineCodePlugin(computer),
    createNormalizeCodeLineVarnamePlugin(),
  ],
});
