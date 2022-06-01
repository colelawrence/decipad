import { useReadOnly, useSelected } from 'slate-react';
import {
  getTableGridAbove,
  selectedCellsAtom,
  useEditorRef,
} from '@udecode/plate';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { dequal } from 'dequal';
import { isEnabled } from '@decipad/feature-flags';

export const useSelectedCells = () => {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = useEditorRef();

  const [selectedCells, setSelectedCells] = useAtom(selectedCellsAtom);

  useEffect(() => {
    if (!selected || readOnly) setSelectedCells(null);
  }, [selected, editor, setSelectedCells, readOnly]);

  useEffect(() => {
    if (!isEnabled('TABLE_CELL_SELECTION')) return;
    if (readOnly) return;

    const cellEntries = getTableGridAbove(editor, { format: 'cell' });
    if (cellEntries.length > 1) {
      const cells = cellEntries.map((entry) => entry[0]);

      if (!dequal(cells, selectedCells)) {
        setSelectedCells(cells);
      }
    } else if (selectedCells) {
      setSelectedCells(null);
    }
  }, [editor, editor.selection, readOnly, selectedCells, setSelectedCells]);
};
