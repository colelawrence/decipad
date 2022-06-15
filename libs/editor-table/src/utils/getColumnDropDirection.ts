import { MyEditor, MyElement } from '@decipad/editor-types';
import { findNodePath } from '@udecode/plate';
import { ColumnDropLine } from '../contexts/tableAtoms';

export const getColumnDropDirection = (
  editor: MyEditor,
  { dropLine, element }: { dropLine: ColumnDropLine; element: MyElement }
) => {
  if (!dropLine) return;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const path = findNodePath(editor, element!);
  if (!path) return;

  const { element: headerElement } = dropLine;
  const headerPath = findNodePath(editor, headerElement);
  if (!headerPath) return;

  if (headerPath[headerPath.length - 1] !== path[path.length - 1]) return;

  return dropLine.direction;
};
