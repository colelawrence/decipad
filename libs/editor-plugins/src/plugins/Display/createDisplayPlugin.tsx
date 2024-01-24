import {
  createMyPluginFactory,
  DisplayElement,
  ELEMENT_DISPLAY,
} from '@decipad/editor-types';
import { Display } from '@decipad/editor-components';
import { nanoid } from 'nanoid';
import { createEventInterceptorPluginFactory } from '../../pluginFactories';

export const createDisplayPlugin = createMyPluginFactory({
  key: ELEMENT_DISPLAY,
  isElement: true,
  isVoid: true,
  component: Display,
  plugins: [
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_DISPLAY',
      elementTypes: [ELEMENT_DISPLAY],
      interceptor: () => {
        return true;
      },
    })(),
  ],
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
