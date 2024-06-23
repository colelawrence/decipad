import type {
  LiveQueryQueryElement,
  LiveQueryVarNameElement,
  MyGenericEditor,
} from '@decipad/editor-types';
import {
  createMyPluginFactory,
  ELEMENT_LIVE_QUERY,
  ELEMENT_LIVE_QUERY_QUERY,
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
} from '@decipad/editor-types';
import {
  assertElementType,
  normalizeIdentifierElement,
} from '@decipad/editor-utils';
import type { ENodeEntry, Value } from '@udecode/plate-common';
import {
  getChildren,
  insertNodes,
  nanoid,
  removeNodes,
} from '@udecode/plate-common';
import { lazyElementComponent } from '../../utils/lazyElement';
import { LiveQueryVarName } from './components/LiveQueryVarName';
import { LiveQueryQuery } from './components/LiveQueryQuery';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { createNormalizerPlugin } from '@decipad/editor-plugin-factories';
import { createSoftBreakLiveQueryPluginFactory } from './createSoftBreakLiveQueryPluginFactory';

const LazyLiveQuery = lazyElementComponent(
  () =>
    import(/* webpackChunkName: "editor-live-query" */ './components/LiveQuery')
);

export const createLiveQueryPlugin = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>() =>
  createMyPluginFactory<object, TV, TE>({
    key: ELEMENT_LIVE_QUERY,
    isElement: true,
    component: LazyLiveQuery,
    plugins: [
      {
        key: ELEMENT_LIVE_QUERY_VARIABLE_NAME,
        isElement: true,
        component: LiveQueryVarName,
      },
      {
        key: ELEMENT_LIVE_QUERY_QUERY,
        isElement: true,
        component: LiveQueryQuery,
      },
      createNormalizerPlugin<TV, TE>({
        name: 'NORMALIZE_LIVE_QUERY_PLUGIN',
        elementType: ELEMENT_LIVE_QUERY,
        plugin:
          (editor) =>
          ([el, path]): NormalizerReturnValue => {
            assertElementType(el, ELEMENT_LIVE_QUERY);

            if (el.children.length < 1) {
              return () =>
                insertNodes<LiveQueryVarNameElement>(
                  editor,
                  {
                    id: nanoid(),
                    type: ELEMENT_LIVE_QUERY_VARIABLE_NAME,
                    children: [{ text: 'LiveQuery' }],
                  },
                  { at: [...path, 0] }
                );
            }
            if (el.children[0].type !== ELEMENT_LIVE_QUERY_VARIABLE_NAME) {
              return () => removeNodes(editor, { at: [...path, 0] });
            }
            if (el.children.length < 2) {
              return () =>
                insertNodes<LiveQueryQueryElement>(
                  editor,
                  {
                    id: nanoid(),
                    type: ELEMENT_LIVE_QUERY_QUERY,
                    children: [{ text: '' }],
                  },
                  { at: [...path, 1] }
                );
            }
            if (el.children[1].type !== ELEMENT_LIVE_QUERY_QUERY) {
              return () => removeNodes(editor, { at: [...path, 1] });
            }

            if (el.children.length > 2) {
              return () => removeNodes(editor, { at: [...path, 2] });
            }
            return false;
          },
      }),
      createSoftBreakLiveQueryPluginFactory<TV, TE>()(),
      createNormalizerPlugin({
        name: 'NORMALIZE_LIVE_QUERY_VAR_NAME',
        elementType: ELEMENT_LIVE_QUERY_VARIABLE_NAME,
        plugin: (editor) => (entry) => {
          return normalizeIdentifierElement<TV, TE>(
            editor,
            getChildren(entry)[0] as ENodeEntry<TV>
          );
        },
      }),
    ],
  });
