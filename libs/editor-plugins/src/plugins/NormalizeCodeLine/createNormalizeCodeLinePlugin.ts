/* eslint-disable no-param-reassign */
import { RemoteComputer } from '@decipad/remote-computer';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_SMART_REF,
  MyEditor,
  MyGenericEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import {
  ENodeEntry,
  Value,
  deleteText,
  getNodeChildren,
  insertText,
  isDefined,
  isElement,
  isText,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate';
import {
  NormalizerReturnValue,
  createNormalizerPlugin,
} from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

export const normalizeCodeChildren = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>(
  _computer: RemoteComputer,
  editor: TE,
  [_node, path]: ENodeEntry<TV>
): NormalizerReturnValue => {
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
            return () =>
              insertText(editor, '\n  ', {
                at: {
                  offset: charIndex + 1,
                  path: lineChildPath,
                },
              });
          }
        }

        if (char === '}') {
          // there is no char before
          if (!charIndex) {
            return () =>
              insertText(editor, '\n', {
                at: {
                  offset: charIndex,
                  path: lineChildPath,
                },
              });
          }

          const charBefore = text[charIndex - 1];

          if (isDefined(charBefore) && !['\n', '{'].includes(charBefore)) {
            return () =>
              insertText(editor, '\n', {
                at: {
                  offset: charIndex,
                  path: lineChildPath,
                },
              });
          }
        }

        if (char === '\t') {
          return () =>
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
        }
      }
    }

    // Children must be text or SmartRef
    if (isElement(lineChildNode) && lineChildNode.type !== ELEMENT_SMART_REF) {
      return () => unwrapNodes(editor, { at: lineChildPath });
    }

    // Text must be plain
    if (!isElement(lineChildNode)) {
      const normalize = normalizeExcessProperties(editor, lineChild);
      if (normalize) {
        return normalize;
      }
    }
  }

  return false;
};

const normalizeCodeLine =
  (computer: RemoteComputer) =>
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    assertElementType(entry[0], ELEMENT_CODE_LINE);

    return normalizeCodeChildren(computer, editor, entry);
  };

export const createNormalizeCodeLinePlugin = (computer: RemoteComputer) =>
  createNormalizerPlugin({
    name: 'NORMALIZE_CODE_LINE_PLUGIN',
    elementType: ELEMENT_CODE_LINE,
    plugin: normalizeCodeLine(computer),
  });
