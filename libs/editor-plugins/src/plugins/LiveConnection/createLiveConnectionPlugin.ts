import { nanoid } from 'nanoid';
import {
  createTPluginFactory,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  LiveConnectionVarNameElement,
} from '@decipad/editor-types';
import {
  assertElementType,
  normalizeIdentifierElement,
} from '@decipad/editor-utils';
import { insertNodes, removeNodes, getChildren } from '@udecode/plate';
import {
  createNormalizerPlugin,
  NormalizerReturnValue,
} from '../../pluginFactories';
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
        ([element, path]): NormalizerReturnValue => {
          assertElementType(element, ELEMENT_LIVE_CONNECTION);
          if (element.children.length < 1) {
            return () =>
              insertNodes<LiveConnectionVarNameElement>(
                editor,
                {
                  id: nanoid(),
                  type: ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
                  children: [{ text: '' }],
                },
                { at: [...path, 1] }
              );
          }
          if (element.children.length > 1) {
            return () => removeNodes(editor, { at: [...path, 1] });
          }
          return false;
        },
    }),
    createNormalizerPlugin({
      name: 'NORMALIZE_LIVE_CONN_VAR_NAME',
      elementType: ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
      plugin: (editor) => (entry) => {
        return normalizeIdentifierElement(editor, getChildren(entry)[0]);
      },
    }),
  ],
});
