import {
  createTPluginFactory,
  ELEMENT_DISPLAY,
  DisplayElement,
} from '@decipad/editor-types';
import { Display } from '@decipad/editor-components';
import { nanoid } from 'nanoid';

export const createDisplayPlugin = createTPluginFactory({
  key: ELEMENT_DISPLAY,
  isElement: true,
  isVoid: true,
  component: Display,
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'div',
      },
    ],
    getNode: (): DisplayElement | undefined => {
      return {
        id: nanoid(),
        type: ELEMENT_DISPLAY,
        blockId: '',
        children: [{ text: '' }],
      };
    },
  },
  serializeHtml: ({ children }) => {
    return <div data-type="display">{children}</div>;
  },
});
