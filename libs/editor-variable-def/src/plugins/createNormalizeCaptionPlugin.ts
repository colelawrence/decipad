import {
  isElement,
  Element,
  ELEMENT_CAPTION,
  isText,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { Editor, Node, NodeEntry, Text, Transforms } from 'slate';
import { normalizeIdentifierElement } from '@decipad/editor-utils';

const normalize =
  (editor: Editor) =>
  (entry: NodeEntry): boolean => {
    const [node, path] = entry;
    if ((node as Element)?.type !== ELEMENT_CAPTION) {
      return false;
    }

    if (!isElement(node)) {
      Transforms.unwrapNodes(editor, { at: path });
      return true;
    }

    if (node.children.length > 1) {
      Transforms.delete(editor, { at: [...path, 1] });
      return true;
    }

    if (!isText(node.children[0])) {
      Transforms.delete(editor, { at: [...path, 0] });
      return true;
    }

    if (node.children.length < 1) {
      Transforms.insertText(editor, '', { at: path });
      return true;
    }

    const [text] = Node.children(editor, path);
    return normalizeIdentifierElement(editor, text as NodeEntry<Text>);
  };

export const createNormalizeCaptionPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_CAPTION_PLUGIN',
  elementType: ELEMENT_CAPTION,
  acceptableElementProperties: ['icon', 'color'],
  plugin: normalize,
});
