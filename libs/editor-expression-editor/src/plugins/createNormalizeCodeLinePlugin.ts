import {
  ELEMENT_CODE_LINE,
  isElement,
  Node,
  Element,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { Editor, NodeEntry, Transforms } from 'slate';

const normalize =
  (editor: Editor) =>
  ([node, path]: NodeEntry): boolean => {
    if (!path.length) {
      // at the root
      const { children = [] } = node as Element;
      if (children.length < 1) {
        Transforms.insertNodes(
          editor,
          { type: ELEMENT_CODE_LINE, children: [{ text: '' }] } as Node,
          { at: [...path, 0] }
        );
        return true;
      }
      if (children.length > 1) {
        Transforms.delete(editor, { at: [...path, 1] });
        return true;
      }
    }
    if (path.length === 1) {
      if (
        !isElement(node as Node) ||
        (node as Element).type !== ELEMENT_CODE_LINE
      ) {
        Transforms.delete(editor, { at: path });
        return true;
      }
      const { children } = node as Element;
      if (children.length > 1) {
        Transforms.delete(editor, { at: [...path, 1] });
        return true;
      }
    }
    return false;
  };

export const createNormalizeCodeLinePlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_CODE_LINE',
  plugin: normalize,
});
