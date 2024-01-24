import { useSelected } from 'slate-react';
import { useMyEditorRef } from '@decipad/editor-types';
import { useEffect } from 'react';
import { dequal } from '@decipad/utils';
import { useTableStore } from '../../contexts/tableStore';
import { getSelectedCells } from '../../utils/getSelectedCells';

export const useSelectedCells = () => {
  const selected = useSelected();
  const editor = useMyEditorRef();

  const [selectedCells, setSelectedCells] = useTableStore().use.selectedCells();

  useEffect(() => {
    if (!selected) setSelectedCells(null);
  }, [selected, editor, setSelectedCells]);

  useEffect(() => {
    const cellEntries = getSelectedCells(editor);

    if (cellEntries.length > 1) {
      const cells = cellEntries.map((entry) => entry[0]);

      if (!dequal(cells, selectedCells)) {
        setSelectedCells(cells);
      }
    } else if (selectedCells) {
      setSelectedCells(null);
    }
  }, [editor, editor.selection, selectedCells, setSelectedCells]);
};
