import { MyEditor, MyElement } from '@decipad/editor-types';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { columnDropLineAtom } from '../contexts/tableAtoms';
import { tableScope } from '../components/Table/index';
import { getColumnDropDirection } from '../utils/getColumnDropDirection';

export const useColumnDropDirection = (
  editor: MyEditor,
  element: MyElement
) => {
  const [columnDropLine] = useAtom(columnDropLineAtom, tableScope);

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
