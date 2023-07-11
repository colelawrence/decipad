import {
  ELEMENT_SMART_REF,
  MyEditor,
  SmartRefElement,
} from '@decipad/editor-types';
import { insertNodes, setSelection } from '@decipad/editor-utils';
import {
  deleteText,
  getEditorString,
  getPointBefore,
  getStartPoint,
  hasNode,
  insertText,
  nanoid,
  select,
} from '@udecode/plate';
import { BasePoint, Range } from 'slate';
import type { MenuItem } from './AutoCompleteMenu';

export const commitAutocompleteItem = (
  editor: MyEditor,
  at: Range,
  item: MenuItem
) => {
  const { decoration } = item;
  const pointBefore = Range.start(at);
  const characterBefore = getCharacterBeforeCursor(editor, pointBefore);

  select(editor, at);
  deleteText(editor);

  let toInsert = '';

  if (needsSpaceAfter(characterBefore)) {
    toInsert += ' ';
  }

  toInsert += item.identifier;

  let moveCursorBack;
  if (item.kind !== 'function') {
    toInsert += ' ';
    moveCursorBack = false;
  } else {
    toInsert += '()';
    moveCursorBack = true;
  }

  if (!item.blockId) {
    insertText(editor, toInsert);
  } else {
    // item may know how we should smartly refer to it
    const [blockId, columnId] = item.isCell
      ? [item.columnId]
      : [item.blockId, item.columnId];

    const smartRef: SmartRefElement = {
      id: nanoid(),
      type: ELEMENT_SMART_REF,
      blockId: blockId || item.blockId,
      columnId: columnId || null, // dont remove, has to do with legacy migration
      decoration,
      children: [{ text: '' }],
    };
    insertNodes(editor, [smartRef, { text: ' ' }]);
  }

  // Move cursor to before the closing parenthesis
  if (editor.selection?.focus && moveCursorBack) {
    const pointToMoveTo = getPointBefore(editor, editor.selection.focus, {
      distance: 1,
      unit: 'character',
    });
    setSelection(editor, { anchor: pointToMoveTo, focus: pointToMoveTo });
  }
};

const charactersThatDontNeedSpaceAfter: ReadonlySet<string> = new Set([
  '',
  ' ',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
]);

const needsSpaceAfter = (character: string) =>
  !charactersThatDontNeedSpaceAfter.has(character);

const getCharacterBeforeCursor = (editor: MyEditor, cursor: BasePoint) =>
  cursor.path && hasNode(editor, cursor.path)
    ? getEditorString(editor, {
        anchor: getStartPoint(editor, cursor.path),
        focus: { path: cursor.path, offset: cursor.offset },
      }).slice(-1)
    : '';
