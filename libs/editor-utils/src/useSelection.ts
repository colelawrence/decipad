import { useEditorChange } from '@decipad/react-contexts';
import { useCallback, useState } from 'react';
import { Selection } from 'slate';
import { useTPlateEditorRef } from '@decipad/editor-types';
import { useSelected } from 'slate-react';

export const useSelection = ({ selected = true } = {}): Selection => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = useTPlateEditorRef()!;
  const isSelected = useSelected();
  const [selection, setSelection] = useState<Selection>(editor.selection);
  useEditorChange(
    setSelection,
    useCallback(
      (e) => (!selected || isSelected ? e.selection : null),
      [selected, isSelected]
    )
  );

  return selection;
};
