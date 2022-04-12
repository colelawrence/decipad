import {
  isElement,
  Element,
  ELEMENT_CAPTION,
  isText,
} from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { identifierRegExpGlobal } from '@decipad/language';
import { Editor, Node, NodeEntry, Transforms } from 'slate';

const normalize =
  (editor: Editor) =>
  ([node, path]: NodeEntry): boolean => {
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

    const leaf = node.children[0];
    const text = Node.string(leaf);
    const replacement =
      text.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
    if (replacement !== text) {
      Transforms.insertText(editor, replacement, { at: [...path, 0] });
      return true;
    }

    return false;
  };

export const createNormalizeCaptionPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_CAPTION_PLUGIN',
  elementType: ELEMENT_CAPTION,
  acceptableElementProperties: [],
  plugin: normalize,
});
