import { nanoid } from 'nanoid';
import {
  createTPluginFactory,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  LiveConnectionVarNameElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { insertNodes, removeNodes } from '@udecode/plate';
import { createNormalizerPlugin } from '../../pluginFactories';
import { lazyElementComponent } from '../../utils/lazyElement';
import { LiveConnectionVarName } from './components/LiveConnectionVarName';

const LazyLiveConnection = lazyElementComponent(
  () =>
    import(
      /* webpackChunkName: "editor-live-connection" */ './components/LiveConnection'
    )
);

export const createLiveConnectionPlugin = createTPluginFactory({
  key: ELEMENT_LIVE_CONNECTION,
  isElement: true,
  component: LazyLiveConnection,
  plugins: [
    {
      key: ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
      isElement: true,
      component: LiveConnectionVarName,
    },
    createNormalizerPlugin({
      name: 'LIVE_CONNECTION_NORMALIZER',
      elementType: ELEMENT_LIVE_CONNECTION,
      plugin:
        (editor) =>
        ([element, path]) => {
          assertElementType(element, ELEMENT_LIVE_CONNECTION);
          const [liveConnVarName, ...rest] = element.children;
          if (!liveConnVarName) {
            insertNodes<LiveConnectionVarNameElement>(
              editor,
              {
                id: nanoid(),
                type: ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
                children: [{ text: '' }],
              },
              { at: [...path, 1] }
            );
            return true;
          }
          if (rest.length > 0) {
            removeNodes(editor, { at: [...path, 2] });
          }
          return false;
        },
    }),
  ],
});
