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
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeList = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node, path] = entry;

  if (
    isElement(node) &&
    (node.type === ELEMENT_UL || node.type === ELEMENT_OL)
  ) {
    if (normalizeExcessProperties(editor, entry)) {
      return true;
    }

    for (const liEntry of getNodeChildren<ChildOf<ListElement>>(editor, path)) {
      const [liNode, liPath] = liEntry;

      if (isElement(liNode) && liNode.type !== ELEMENT_LI) {
        unwrapNodes(editor, { at: liPath });
        return true;
      }

      if (isText(liNode)) {
        wrapNodes(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_LI,
            children: [],
          } as unknown as ListItemElement,
          { at: liPath }
        );
        return true;
      }
    }
  }

  if (isElement(node) && node.type === ELEMENT_LI) {
    if (normalizeExcessProperties(editor, entry)) {
      return true;
    }

    const [licEntry, _listChildEntry, ..._furtherChildren] = getNodeChildren<
      ChildOf<ListItemElement>
    >(editor, path);
    const listChildEntry =
      _listChildEntry as unknown as TNodeEntry<ListElement>;
    const furtherChildren = _furtherChildren as TNodeEntry<TElement>[];

    // LIC child
    if (!licEntry) {
      insertNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_LIC,
          children: [{ text: '' }],
        },
        { at: [...path, 0] }
      );
      return true;
    }

    const [licChildNode, licChildPath] = licEntry;

    if (isElement(licChildNode) && licChildNode.type !== ELEMENT_LIC) {
      unwrapNodes(editor, { at: licChildPath });
      return true;
    }

    if (isText(licChildNode)) {
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
      return true;
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
        removeNodes(editor, { at: listChildPath });
        return true;
      }

      if (furtherChildren.length) {
        // Further children not allowed
        const furtherChildEntry = furtherChildren[0];
        const [, furtherChildPath] = furtherChildEntry;
        removeNodes(editor, { at: furtherChildPath });
        return true;
      }
    }
  }

  return false;
};
export const createNormalizeListPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_LIST_PLUGIN',
  plugin: normalizeList,
});
