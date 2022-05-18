import { useEditorChange } from '@decipad/react-contexts';
import { usePlateEditorRef } from '@udecode/plate';
import { useCallback, useState } from 'react';
import { Selection } from 'slate';

export const useSelection = (): Selection => {
  const editor = usePlateEditorRef();
  const [selection, setSelection] = useState<Selection>(editor.selection);
  useEditorChange(
    setSelection,
    useCallback((e) => e.selection, [])
  );

  return selection;
};
