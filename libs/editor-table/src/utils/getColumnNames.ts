import { Path } from 'slate';
import { getNodeChildren, getNodeString } from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';

export const getColumnNames = (editor: MyEditor, path: Path): Set<string> => {
  const headerRowPath = [...path, 1];
  return new Set(
    Array.from(getNodeChildren(editor, headerRowPath)).map((th) =>
      getNodeString(th[0])
    )
  );
};
