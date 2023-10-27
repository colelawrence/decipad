import { Path } from 'slate';
import { TEditor, Value, getNodeChildren, getNodeString } from '@udecode/plate';

export const getColumnNames = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>(
  editor: TE,
  path: Path
): Set<string> => {
  const headerRowPath = [...path, 1];
  return new Set(
    Array.from(getNodeChildren(editor, headerRowPath)).map((th) =>
      getNodeString(th[0])
    )
  );
};
