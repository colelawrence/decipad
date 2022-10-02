import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import {
  getPath,
  getPluginType,
  insertElements,
  PlateEditor,
  Value,
  ExitBreakRule,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { exitBreakAtEdges } from './exitBreakAtEdges';

export const exitBreak = <V extends Value>(
  editor: PlateEditor<V>,
  {
    level = 0,
    defaultType = getPluginType(editor, ELEMENT_PARAGRAPH),
    query = {},
    before,
  }: Omit<ExitBreakRule, 'hotkey'>
) => {
  if (!editor.selection) return;

  const { queryEdge, isEdge, isStart } = exitBreakAtEdges(editor, query);
  // eslint-disable-next-line no-param-reassign
  if (isStart) before = true;

  if (queryEdge && !isEdge) return;

  const selectionPath = getPath(editor, editor.selection);

  let insertPath;
  if (before) {
    insertPath = selectionPath.slice(0, level + 1);
  } else {
    insertPath = Path.next(selectionPath.slice(0, level + 1));
  }

  insertElements(
    editor,
    { type: defaultType, children: [{ text: '' }], id: nanoid() },
    {
      at: insertPath,
      select: !isStart,
    }
  );

  return true;
};
