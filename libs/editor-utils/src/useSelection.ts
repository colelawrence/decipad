import { useEditorChange } from '@decipad/react-contexts';
import { useCallback, useState } from 'react';
import { Selection } from 'slate';
import { useTPlateEditorRef } from '@decipad/editor-types';

export const useSelection = (): Selection => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = useTPlateEditorRef()!;
  const [selection, setSelection] = useState<Selection>(editor.selection);
  useEditorChange(
    setSelection,
    useCallback((e) => e.selection, [])
  );

  return selection;
};
