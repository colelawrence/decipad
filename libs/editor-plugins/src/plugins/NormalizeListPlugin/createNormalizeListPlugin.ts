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
  deleteText,
  getNodeChildren,
  isElement,
  isText,
  unwrapNodes,
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

    for (const childEntry of getNodeChildren<ChildOf<ListElement>>(
      editor,
      path
    )) {
      const [childNode, childPath] = childEntry;

      if (isElement(childNode) && childNode.type !== ELEMENT_LI) {
        unwrapNodes(editor, { at: childPath });
        return true;
      }

      if (isText(childNode)) {
        wrapNodes(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_LI,
            children: [],
          } as unknown as ListItemElement,
          { at: childPath }
        );
        return true;
      }
    }
  }

  if (isElement(node) && node.type === ELEMENT_LI) {
    if (normalizeExcessProperties(editor, entry)) {
      return true;
    }

    const [licChild, listChild, ...furtherChildren] = getNodeChildren<
      ChildOf<ListItemElement>
    >(editor, path);

    // LIC child
    if (!licChild) {
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

    const [licChildNode, licChildPath] = licChild;

    if (isElement(licChildNode) && licChildNode.type !== ELEMENT_LIC) {
      unwrapNodes(editor, { at: licChildPath });
      return true;
    }

    if (isText(licChildNode)) {
      wrapNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_LIC,
          children: [],
        },
        { at: licChildPath }
      );
      return true;
    }

    // Optional list child
    if (listChild) {
      const [listChildNode, listChildPath] = listChild;
      if (
        !(
          isElement(listChildNode) &&
          ((listChildNode.type as string) === ELEMENT_UL ||
            (listChildNode.type as string) === ELEMENT_OL)
        )
      ) {
        deleteText(editor, { at: listChildPath });
        return true;
      }

      if (furtherChildren.length) {
        // Further children not allowed
        const furtherChildEntry = furtherChildren[0];
        const [, furtherChildPath] = furtherChildEntry;
        deleteText(editor, { at: furtherChildPath });
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
