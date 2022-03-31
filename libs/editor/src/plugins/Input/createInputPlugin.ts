import { ELEMENT_INPUT } from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate';
import { Input } from '../../components';

export const createInputPlugin = createPluginFactory({
  key: ELEMENT_INPUT,
  isElement: true,
  isVoid: true,
  component: Input,
});
