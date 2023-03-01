import { Computer } from '@decipad/computer';
import {
  createEventInterceptorPluginFactory,
  createStructuredKeyboard,
} from '@decipad/editor-plugins';
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

const createCodeLineRootPlugin = (_computer: Computer) => ({
  key: ELEMENT_CODE_LINE_V2,
  isElement: true,
  component: CodeLineV2,
});
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

export const createCodeLineV2Plugin = (computer: Computer): MyPlatePlugin => ({
  key: 'CODE_LINE_V2_ROOT',
  plugins: [
    createCodeLineRootPlugin(computer),
    createCodeLineVarnamePlugin(computer),
    createCodeLineCodeTextPlugin(computer),
    createNormalizeCodeLineV2Plugin(),
    createNormalizeCodeLineCodePlugin(computer),
    createNormalizeCodeLineVarnamePlugin(),
    createStructuredKeyboard(computer),
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_CODE_LINE_V2',
      elementTypes: [ELEMENT_CODE_LINE_V2],
      interceptor: (_editor, _entry, e) => {
        // Keyboard shortcut for creating a new element.
        return e.event.key !== 'Enter';
      },
    })(),
  ],
});
