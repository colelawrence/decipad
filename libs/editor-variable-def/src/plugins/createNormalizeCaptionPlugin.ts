import { ELEMENT_CAPTION, MyEditor, MyNodeEntry } from '@decipad/editor-types';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '@decipad/editor-plugins';
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
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;
    if (isElement(node) && node.type !== ELEMENT_CAPTION) {
      return false;
    }

    if (!isElement(node)) {
      return () => unwrapNodes(editor, { at: path });
    }

    if (node.children.length > 1) {
      return () => deleteText(editor, { at: [...path, 1] });
    }

    if (!isText(node.children[0])) {
      return () => deleteText(editor, { at: [...path, 0] });
    }

    if (node.children.length < 1) {
      return () => insertText(editor, '', { at: path });
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
