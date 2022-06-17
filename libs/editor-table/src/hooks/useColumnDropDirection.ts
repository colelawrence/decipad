import { useContext, useMemo } from 'react';
import { MyEditor, MyElement } from '@decipad/editor-types';

import { getColumnDropDirection } from '../utils/getColumnDropDirection';
import { TableDndContext } from '../contexts/TableDndContext';

export const useColumnDropDirection = (
  editor: MyEditor,
  element: MyElement
) => {
  const { columnDropLine } = useContext(TableDndContext);

  return useMemo(
    () =>
      getColumnDropDirection(editor, {
        dropLine: columnDropLine,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        element: element!,
      }),
    [columnDropLine, editor, element]
  );
};
