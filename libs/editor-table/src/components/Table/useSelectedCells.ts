import { useSelected } from 'slate-react';
import { getTableGridAbove, useEditorRef } from '@udecode/plate';
import { useEffect } from 'react';
import { dequal } from '@decipad/utils';
import { useTableStore } from '../../contexts/tableStore';

export const useSelectedCells = () => {
  const selected = useSelected();
  const editor = useEditorRef();

  const [selectedCells, setSelectedCells] = useTableStore().use.selectedCells();

  useEffect(() => {
    if (!selected) setSelectedCells(null);
  }, [selected, editor, setSelectedCells]);

  useEffect(() => {
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

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
