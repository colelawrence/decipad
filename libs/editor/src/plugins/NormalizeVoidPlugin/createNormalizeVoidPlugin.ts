/* eslint-disable no-param-reassign */
import {
  WithOverride,
  TNode,
  getPlatePluginWithOverrides,
  isElement,
  isText,
} from '@udecode/plate';
import { Node, NodeEntry, Transforms } from 'slate';
import { ELEMENT_TABLE_INPUT, ELEMENT_FETCH } from '../../elements';
import { normalizeExcessProperties } from '../../utils/normalize';

const VOID_TYPE_PROPERTIES = {
  [ELEMENT_TABLE_INPUT]: ['tableData'],
  [ELEMENT_FETCH]: [
    'data-auth-url',
    'data-contenttype',
    'data-error',
    'data-external-data-source-id',
    'data-external-id',
    'data-href',
    'data-provider',
    'data-varname',
  ],
};

const withNormalizeVoid = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (Object.keys(VOID_TYPE_PROPERTIES).includes(node.type)) {
      if (
        normalizeExcessProperties(
          editor,
          entry,
          VOID_TYPE_PROPERTIES[node.type as keyof typeof VOID_TYPE_PROPERTIES]
        )
      ) {
        return;
      }

      for (const childEntry of Node.children(editor, path)) {
        const [childNode, childPath] = childEntry as NodeEntry<TNode>;

        if (
          isElement(childNode) ||
          (isText(childNode) && childNode.text !== '')
        ) {
          Transforms.delete(editor, { at: childPath });
          return;
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

export const createNormalizeVoidPlugin =
  getPlatePluginWithOverrides(withNormalizeVoid);
