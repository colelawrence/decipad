import type { RemoteComputer } from '@decipad/remote-computer';

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

const createCodeLineRootPlugin = (_computer: RemoteComputer) => ({
  key: ELEMENT_CODE_LINE_V2,
  isElement: true,
});
const createCodeLineVarnamePlugin = (_computer: RemoteComputer) => ({
  key: ELEMENT_STRUCTURED_VARNAME,
  isElement: true,
});

export const createCodeLineV2NoUiPlugin = (
  computer: RemoteComputer
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
