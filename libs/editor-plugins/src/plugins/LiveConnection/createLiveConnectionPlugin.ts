import { nanoid } from 'nanoid';
import {
  createTPluginFactory,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ELEMENT_LIVE_DATASET,
  ELEMENT_LIVE_DATASET_VARIABLE_NAME,
  ELEMENT_LIVE_QUERY,
  ELEMENT_LIVE_QUERY_QUERY,
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
  LiveConnectionVarNameElement,
  LiveDataSetVarNameElement,
  LiveQueryElement,
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
import { LiveDataSetVarName } from './components/LiveDataSetVarName';

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

export const createLiveDataSetPlugin = createTPluginFactory({
  key: ELEMENT_LIVE_DATASET,
  isElement: true,
  component: LazyLiveConnection,
  plugins: [
    {
      key: ELEMENT_LIVE_DATASET_VARIABLE_NAME,
      isElement: true,
      component: LiveDataSetVarName,
    },
    createNormalizerPlugin({
      name: 'LIVE_DATASET_NORMALIZER',
      elementType: ELEMENT_LIVE_DATASET,
      plugin:
        (editor) =>
        ([element, path]): NormalizerReturnValue => {
          assertElementType(element, ELEMENT_LIVE_DATASET);
          if (element.children.length < 1) {
            return () =>
              insertNodes<LiveDataSetVarNameElement>(
                editor,
                {
                  id: nanoid(),
                  type: ELEMENT_LIVE_DATASET_VARIABLE_NAME,
                  children: [{ text: '' }],
                },
                { at: [...path, 1] }
              );
          }

          if (element.children.length < 2) {
            return () =>
              insertNodes<LiveQueryElement>(
                editor,
                {
                  type: ELEMENT_LIVE_QUERY,
                  id: nanoid(),
                  connectionBlockId: element.id,
                  columnTypeCoercions: {},
                  children: [
                    {
                      type: ELEMENT_LIVE_QUERY_VARIABLE_NAME,
                      id: nanoid(),
                      children: [{ text: '' }],
                    },
                    {
                      type: ELEMENT_LIVE_QUERY_QUERY,
                      id: nanoid(),
                      children: [{ text: 'SELECT 1 + 1 as result' }],
                    },
                  ],
                },
                { at: [...path, 1] }
              );
          }

          if (element.children.length > 2) {
            return () => removeNodes(editor, { at: [...path, 2] });
          }
          return false;
        },
    }),
    createNormalizerPlugin({
      name: 'NORMALIZE_LIVE_DS_VAR_NAME',
      elementType: ELEMENT_LIVE_DATASET_VARIABLE_NAME,
      plugin: (editor) => (entry) => {
        return normalizeIdentifierElement(editor, getChildren(entry)[0]);
      },
    }),
  ],
});
