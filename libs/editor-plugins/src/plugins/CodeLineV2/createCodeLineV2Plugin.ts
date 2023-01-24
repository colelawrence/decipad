import { Computer } from '@decipad/computer';
import { createEventInterceptorPluginFactory } from '@decipad/editor-plugins';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  MyPlatePlugin,
} from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import {
  CodeLineV2Code,
  CodeLineV2,
  CodeLineV2Varname,
} from '@decipad/editor-components';
import {
  createNormalizeCodeLineCodePlugin,
  createNormalizeCodeLineV2Plugin,
  createNormalizeCodeLineVarnamePlugin,
} from './normalization';
import { createSelectionContainmentPlugin } from './selectionContainmentPlugin';

const createCodeLineVarnamePlugin = (_computer: Computer) => ({
  key: ELEMENT_STRUCTURED_VARNAME,
  isElement: true,
  component: CodeLineV2Varname,
});
const createCodeLineCodeTextPlugin = (_computer: Computer) => ({
  key: ELEMENT_CODE_LINE_V2_CODE,
  isElement: true,
  component: CodeLineV2Code,
  decorate: decorateCode(ELEMENT_CODE_LINE_V2_CODE),
});
const createCodeLineRootPlugin = (_computer: Computer) => ({
  key: ELEMENT_CODE_LINE_V2,
  isElement: true,
  component: CodeLineV2,
});

export const createCodeLineV2Plugin = (computer: Computer): MyPlatePlugin => ({
  key: 'CODE_LINE_V2_ROOT',
  plugins: [
    createCodeLineCodeTextPlugin(computer),
    createCodeLineVarnamePlugin(computer),
    createCodeLineRootPlugin(computer),
    createNormalizeCodeLineV2Plugin(),
    createNormalizeCodeLineCodePlugin(computer),
    createNormalizeCodeLineVarnamePlugin(),
    createSelectionContainmentPlugin(ELEMENT_CODE_LINE_V2_CODE),
    createSelectionContainmentPlugin(ELEMENT_STRUCTURED_VARNAME),
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_CODE_LINE_V2',
      elementTypes: [ELEMENT_CODE_LINE_V2],
      interceptor: () => {
        return true;
      },
    })(),
  ],
});
