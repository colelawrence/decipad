/* eslint-disable no-param-reassign */
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
  ListElement,
  ListItemElement,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import {
  ChildOf,
  getNodeChildren,
  isElement,
  isText,
  removeNodes,
  TElement,
  TNodeEntry,
  unwrapNodes,
  wrapNodeChildren,
  wrapNodes,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeList =
  (editor: MyEditor) =>
  // eslint-disable-next-line complexity
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;

    if (
      isElement(node) &&
      (node.type === ELEMENT_UL || node.type === ELEMENT_OL)
    ) {
      const normalize = normalizeExcessProperties(editor, entry);
      if (normalize) {
        return normalize;
      }

      for (const liEntry of getNodeChildren<ChildOf<ListElement>>(
        editor,
        path
      )) {
        const [liNode, liPath] = liEntry;

        if (isElement(liNode) && liNode.type !== ELEMENT_LI) {
          return () => unwrapNodes(editor, { at: liPath });
        }

        if (isText(liNode)) {
          return () =>
            wrapNodes(
              editor,
              {
                id: nanoid(),
                type: ELEMENT_LI,
                children: [],
              } as unknown as ListItemElement,
              { at: liPath }
            );
        }
      }
    }

    if (isElement(node) && node.type === ELEMENT_LI) {
      const normalize = normalizeExcessProperties(editor, entry);
      if (normalize) {
        return normalize;
      }

      const [licEntry, _listChildEntry, ..._furtherChildren] = getNodeChildren<
        ChildOf<ListItemElement>
      >(editor, path);
      const listChildEntry =
        _listChildEntry as unknown as TNodeEntry<ListElement>;
      const furtherChildren = _furtherChildren as TNodeEntry<TElement>[];

      // LIC child
      if (!licEntry) {
        return () =>
          insertNodes(
            editor,
            [
              {
                id: nanoid(),
                type: ELEMENT_LIC,
                children: [{ text: '' }],
              },
            ],
            { at: [...path, 0] }
          );
      }
      const [licChildNode, licChildPath] = licEntry;

      if (isElement(licChildNode) && licChildNode.type !== ELEMENT_LIC) {
        return () => unwrapNodes(editor, { at: licChildPath });
      }

      if (isText(licChildNode)) {
        return () =>
          wrapNodeChildren(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_LIC,
              children: [],
            },
            {
              at: path,
            }
          );
      }

      // Optional list child
      if (listChildEntry) {
        const [listChildNode, listChildPath] = listChildEntry;
        if (
          !(
            isElement(listChildNode) &&
            ((listChildNode.type as string) === ELEMENT_UL ||
              (listChildNode.type as string) === ELEMENT_OL)
          )
        ) {
          return () => removeNodes(editor, { at: listChildPath });
        }
      }

      if (furtherChildren.length) {
        // Further children not allowed
        const furtherChildEntry = furtherChildren[0];
        const [, furtherChildPath] = furtherChildEntry;
        return () => removeNodes(editor, { at: furtherChildPath });
      }
    }

    return false;
  };
export const createNormalizeListPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_LIST_PLUGIN',
  plugin: normalizeList,
});
