import { Input } from '@decipad/editor-components';
import { ELEMENT_INPUT } from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate';

export const createInputPlugin = createPluginFactory({
  key: ELEMENT_INPUT,
  isElement: true,
  isVoid: true,
  component: Input,
});
