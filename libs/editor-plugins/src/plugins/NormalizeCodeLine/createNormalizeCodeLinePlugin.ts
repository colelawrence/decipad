/* eslint-disable no-param-reassign */
import { Computer } from '@decipad/computer';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_SMART_REF,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { assertElementType, normalizeSmartRefs } from '@decipad/editor-utils';
import {
  deleteText,
  getNodeChildren,
  insertText,
  isDefined,
  isElement,
  isText,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { createNormalizerPlugin } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

export const normalizeCodeChildren = (
  computer: Computer,
  editor: MyEditor,
  [_node, path]: MyNodeEntry
) => {
  const children = Array.from(getNodeChildren(editor, path));
  for (const lineChild of children) {
    const [lineChildNode, lineChildPath] = lineChild;

    if (isText(lineChildNode)) {
      const { text } = lineChildNode;

      // replace tabs by double space
      for (let charIndex = 0; charIndex < text.length; charIndex += 1) {
        const char = text[charIndex];

        if (charIndex < text.length - 1) {
          const charAfter = text[charIndex + 1];

          // if char is { and next char is not a new line
          if (
            char === '{' &&
            isDefined(charAfter) &&
            !['\n', '}'].includes(charAfter)
          ) {
            insertText(editor, '\n  ', {
              at: {
                offset: charIndex + 1,
                path: lineChildPath,
              },
            });
            return false;
          }
        }

        if (char === '}') {
          // there is no char before
          if (!charIndex) {
            insertText(editor, '\n', {
              at: {
                offset: charIndex,
                path: lineChildPath,
              },
            });
            return false;
          }

          const charBefore = text[charIndex - 1];

          if (isDefined(charBefore) && !['\n', '{'].includes(charBefore)) {
            insertText(editor, '\n', {
              at: {
                offset: charIndex,
                path: lineChildPath,
              },
            });
            return false;
          }
        }

        if (char === '\t') {
          withoutNormalizing(editor, () => {
            deleteText(editor, {
              at: {
                offset: charIndex,
                path: lineChildPath,
              },
            });
            insertText(editor, '  ', {
              at: {
                offset: charIndex,
                path: lineChildPath,
              },
            });
          });
          return true;
        }
      }
    }

    // Children must be text or SmartRef
    if (isElement(lineChildNode) && lineChildNode.type !== ELEMENT_SMART_REF) {
      unwrapNodes(editor, { at: lineChildPath });
      return true;
    }

    // add or extend smart refs
    if (normalizeSmartRefs(lineChildNode, lineChildPath, editor, computer)) {
      return true;
    }

    // Text must be plain
    if (
      !isElement(lineChildNode) &&
      normalizeExcessProperties(editor, lineChild)
    ) {
      return true;
    }
  }

  return false;
};

const normalizeCodeLine =
  (computer: Computer) => (editor: MyEditor) => (entry: MyNodeEntry) => {
    assertElementType(entry[0], ELEMENT_CODE_LINE);

    if (normalizeCodeChildren(computer, editor, entry)) {
      return true;
    }

    return false;
  };

export const createNormalizeCodeLinePlugin = (computer: Computer) =>
  createNormalizerPlugin({
    name: 'NORMALIZE_CODE_LINE_PLUGIN',
    elementType: ELEMENT_CODE_LINE,
    plugin: normalizeCodeLine(computer),
  });
