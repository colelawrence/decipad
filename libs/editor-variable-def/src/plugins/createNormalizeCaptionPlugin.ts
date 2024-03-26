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
} from '@udecode/plate-common';
import { RemoteComputer } from '@decipad/remote-computer';
import { Path } from 'slate';

/**
 * Solves the edge case of widgets being in columns or top level.
 *
 * As this part of the code is only ran if the identifiers are invalid
 * IE: Something rather odd has happened.
 *
 * It is ok to have weird names such as these to guarantee uniqueness.
 */
function getPrefixAndStart(path: Path): [string, number] {
  const isInColumn = path.length === 3;
  const topLevelPath = path[0];

  if (isInColumn) {
    const colPath = path[1];
    return [`Col${topLevelPath + 1}Slider`, colPath + 1];
  }

  return ['Slider', topLevelPath + 1];
}

const normalize =
  (computer: RemoteComputer) =>
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

    const [name, start] = getPrefixAndStart(path);

    return normalizeIdentifierElement(editor, text, () =>
      computer.getAvailableIdentifier(name, start, false)
    );
  };

export const createNormalizeCaptionPlugin = (computer: RemoteComputer) =>
  createNormalizerPluginFactory({
    name: 'NORMALIZE_CAPTION_PLUGIN',
    elementType: ELEMENT_CAPTION,
    acceptableElementProperties: ['icon', 'color'],
    plugin: normalize(computer),
  });
