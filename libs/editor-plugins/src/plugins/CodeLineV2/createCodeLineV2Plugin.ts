import { RemoteComputer } from '@decipad/remote-computer';
import {
  createEventInterceptorPluginFactory,
  createStructuredKeyboard,
} from '@decipad/editor-plugins';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  MyPlatePlugin,
  MyValue,
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
import { PlateEditor, Value } from '@udecode/plate';

const createCodeLineRootPlugin = (_computer: RemoteComputer) => ({
  key: ELEMENT_CODE_LINE_V2,
  isElement: true,
  component: CodeLineV2,
});
const createCodeLineVarnamePlugin = (_computer: RemoteComputer) => ({
  key: ELEMENT_STRUCTURED_VARNAME,
  isElement: true,
  component: CodeLineV2Varname,
});
const createCodeLineCodeTextPlugin = <
  TV extends Value = MyValue,
  TE extends PlateEditor<TV> = PlateEditor<TV>
>(
  computer: RemoteComputer
) => ({
  key: ELEMENT_CODE_LINE_V2_CODE,
  isElement: true,
  component: CodeLineV2Code,
  decorate: decorateCode<TV, TE>(computer, ELEMENT_CODE_LINE_V2_CODE),
});

export const createCodeLineV2Plugin = <
  TV extends Value = MyValue,
  TE extends PlateEditor<TV> = PlateEditor<TV>
>(
  computer: RemoteComputer
): MyPlatePlugin => ({
  key: 'CODE_LINE_V2_ROOT',
  plugins: [
    createCodeLineRootPlugin(computer),
    createCodeLineVarnamePlugin(computer),
    createCodeLineCodeTextPlugin(computer),
    createNormalizeCodeLineV2Plugin(),
    createNormalizeCodeLineCodePlugin(computer),
    createNormalizeCodeLineVarnamePlugin(),
    createStructuredKeyboard<TV, TE>(computer) as any,
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
