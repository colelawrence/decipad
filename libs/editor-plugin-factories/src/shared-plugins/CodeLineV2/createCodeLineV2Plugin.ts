import type { Computer } from '@decipad/computer-interfaces';
import type { MyPlatePlugin } from '@decipad/editor-types';
import { ELEMENT_CODE_LINE_V2 } from '@decipad/editor-types';

import {
  createNormalizeCodeLineCodePlugin,
  createNormalizeCodeLineV2Plugin,
  createNormalizeCodeLineVarnamePlugin,
} from './normalization';
import type { PlatePlugin } from '@udecode/plate-common';
import { createEventInterceptorPluginFactory } from '../../createEventInterceptorPluginFactory';

export const createCodeLineV2Plugin = (
  computer: Computer,
  ...extras: Array<PlatePlugin>
): MyPlatePlugin => ({
  key: 'CODE_LINE_V2_ROOT',
  plugins: [
    createNormalizeCodeLineV2Plugin(),
    createNormalizeCodeLineCodePlugin(computer),
    createNormalizeCodeLineVarnamePlugin(),
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_CODE_LINE_V2',
      elementTypes: [ELEMENT_CODE_LINE_V2],
      interceptor: (_editor, _entry, e) => {
        // Keyboard shortcut for creating a new element.
        return e.event.key !== 'Enter';
      },
    })(),
    ...(extras as any),
  ],
});
