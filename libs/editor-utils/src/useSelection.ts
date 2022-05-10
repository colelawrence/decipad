import { usePlateEditorRef } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';
import { Selection } from 'slate';

export const useSelection = (): Selection => {
  const editor = usePlateEditorRef();
  const [selection, setSelection] = useState<Selection>(editor.selection);
  useEffect(() => {
    const { onChange } = editor;
    editor.onChange = () => {
      const newSelection = editor.selection;
      if (!dequal(newSelection, selection)) {
        setSelection(newSelection);
      }
      onChange();
    };
    return () => {
      editor.onChange = onChange;
    };
  }, [editor, selection]);

  return selection;
};
