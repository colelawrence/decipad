import { ELEMENT_CAPTION, MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { normalizeIdentifierElement } from '@decipad/editor-utils';
import {
  deleteText,
  getChildren,
  insertText,
  isElement,
  isText,
  unwrapNodes,
} from '@udecode/plate';

const normalize =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
    const [node, path] = entry;
    if (isElement(node) && node.type !== ELEMENT_CAPTION) {
      return false;
    }

    if (!isElement(node)) {
      unwrapNodes(editor, { at: path });
      return true;
    }

    if (node.children.length > 1) {
      deleteText(editor, { at: [...path, 1] });
      return true;
    }

    if (!isText(node.children[0])) {
      deleteText(editor, { at: [...path, 0] });
      return true;
    }

    if (node.children.length < 1) {
      insertText(editor, '', { at: path });
      return true;
    }

    const [text] = getChildren(entry);
    return normalizeIdentifierElement(editor, text);
  };

export const createNormalizeCaptionPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_CAPTION_PLUGIN',
  elementType: ELEMENT_CAPTION,
  acceptableElementProperties: ['icon', 'color'],
  plugin: normalize,
});
