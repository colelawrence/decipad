import { ELEMENT_CODE_LINE, MyEditor } from '@decipad/editor-types';
import {
  getAboveNode,
  getNodeChildren,
  getPointAfter,
  insertText,
  isElement,
  isText,
  someNode,
  TNodeEntry,
  TOperation,
} from '@udecode/plate';
import { normalizeCodeLineSpace } from './normalizeCodeLineSpace';

export const applyCodeLineSelection = (editor: MyEditor, op: TOperation) => {
  if (op.type !== 'set_selection' || !op.properties) return;

  let entry: TNodeEntry | undefined;

  try {
    entry = getAboveNode(editor, {
      at: op.properties as any,
      match: (n) => isElement(n) && n.type === ELEMENT_CODE_LINE,
    });
  } catch (err) {
    return;
  }

  // selection was not in code line
  if (!entry) return;
  const [, path] = entry;

  let insideCodeLine: boolean;

  try {
    insideCodeLine = someNode(editor, {
      at: op.newProperties as any,
      match: (n) => isElement(n) && n.type === ELEMENT_CODE_LINE,
    });
  } catch (err) {
    return;
  }

  // we're still in code line
  if (insideCodeLine) return;

  const children = Array.from(getNodeChildren(editor, path));

  let index = -1;
  for (const lineChild of children) {
    index += 1;

    const [lineChildNode, lineChildPath] = lineChild;

    if (!index && isText(lineChildNode)) {
      const { text } = lineChildNode;
      const equalIndex = text.indexOf('=');
      const doubleEquals = text.indexOf('==');
      if (equalIndex > 0 && equalIndex !== doubleEquals) {
        const charBefore = text[equalIndex - 1];

        // if there is no space before =
        if (charBefore !== ' ') {
          // insert space before =
          insertText(editor, ' ', {
            at: {
              offset: equalIndex,
              path: lineChildPath,
            },
          });

          applyCodeLineSelection(editor, op);
          return;
        }

        const pointAfter = getPointAfter(editor, {
          offset: equalIndex,
          path: lineChildPath,
        });
        const charAfter = text[equalIndex + 1];

        // if there is no space after =
        if (
          pointAfter &&
          // Path.equals(pointAfter.path, lineChildPath) &&
          charAfter !== ' '
        ) {
          // insert space after =
          insertText(editor, ' ', {
            at: {
              offset: equalIndex + 1,
              path: lineChildPath,
            },
          });

          applyCodeLineSelection(editor, op);
          return;
        }
      }
    }
  }

  // selection is set from inside to outside code line -> normalize
  normalizeCodeLineSpace(editor, entry);
};
