import { MyEditor, MyElement } from '@decipad/editor-types';
import { findNodePath } from '@udecode/plate';
import { ColumnDropLine } from '../contexts/TableDndContext';

export const getColumnDropDirection = (
  editor: MyEditor,
  { dropLine, element }: { dropLine: ColumnDropLine | null; element: MyElement }
) => {
  if (!dropLine) return;

  const path = findNodePath(editor, element);
  if (!path) return;

  const { element: headerElement } = dropLine;
  const headerPath = findNodePath(editor, headerElement);
  if (!headerPath) return;

  if (headerPath[headerPath.length - 1] !== path[path.length - 1]) return;

  return dropLine.direction;
};
