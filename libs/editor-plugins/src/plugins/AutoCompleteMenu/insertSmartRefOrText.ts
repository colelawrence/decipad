import { Computer } from '@decipad/computer';
import {
  ELEMENT_SMART_REF,
  ELEMENT_CODE_LINE,
  MyEditor,
  SmartRefElement,
} from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import {
  findNode,
  getChildren,
  getEndPoint,
  insertNodes,
  insertText,
  isText,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { setSelection } from '../NormalizeCodeBlock/utils';

interface ParseIdentifierResult {
  isColumn: boolean;
  baseRef: string;
  rest?: string;
}

const parseIdentifier = (identifier: string): ParseIdentifierResult => {
  let baseRef = identifier;
  const isColumnIndex = identifier.indexOf('.');
  let rest: string | undefined;
  if (isColumnIndex > 0) {
    baseRef = identifier.slice(0, isColumnIndex);
    rest = identifier.slice(isColumnIndex);
  }
  return {
    isColumn: isColumnIndex > 0,
    baseRef,
    rest,
  };
};

export const insertSmartRefOrText = (
  editor: MyEditor,
  computer: Computer,
  identifier: string
) => {
  const { baseRef, rest } = parseIdentifier(identifier);
  const blockId = computer.getVarBlockId(baseRef);
  if (blockId && isFlagEnabled('EXPR_REFS')) {
    const smartRef: SmartRefElement = {
      id: nanoid(),
      type: ELEMENT_SMART_REF,
      blockId,
      children: [{ text: '' }],
    };
    withoutNormalizing(editor, () => {
      const codeLineEntry =
        editor.selection &&
        findNode(editor, {
          at: editor.selection,
          match: { type: ELEMENT_CODE_LINE },
        });
      if (codeLineEntry) {
        const [firstChild] = getChildren(codeLineEntry);
        if (firstChild && !isText(firstChild)) {
          // a void element cannot be the first child
          insertNodes(editor, { text: '' }, { at: [...codeLineEntry[1], 0] });
        }
      }
      insertNodes(editor, smartRef);
      const refEntry = findNode(editor, { match: { id: smartRef.id } });
      if (rest && refEntry) {
        const [, refPath] = refEntry;
        const restPath = [...refPath.slice(0, -1), refPath[refPath.length - 1]];
        insertText(editor, `${rest} `, { at: restPath });
        const newSel = getEndPoint(editor, restPath);
        setSelection(editor, { focus: newSel, anchor: newSel });
      }
    });
  } else {
    insertText(editor, identifier);
  }
};
