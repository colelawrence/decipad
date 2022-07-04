import {
  TableCellElement,
  TableCellType,
  TableElement,
  TableHeaderElement,
  TableHeaderRowElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { findNodePath, getChildren, getParentNode } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';
import { NodeEntry } from 'slate';

export const useCellType = (
  element: TableCellElement | TableHeaderElement
): TableCellType | undefined => {
  const [cellType, setCellType] = useState<TableCellType | undefined>();
  const editor = useTEditorRef();

  useEffect(() => {
    const { onChange } = editor;

    const getCellType = () => {
      const path = findNodePath(editor, element);
      if (path) {
        const columnIndex = path[path.length - 1];
        const tr = getParentNode(editor, path);
        if (tr && columnIndex != null) {
          const table = getDefined(getParentNode<TableElement>(editor, tr[1]));
          const headerRow = getChildren(
            table
          )[1] as NodeEntry<TableHeaderRowElement>;
          if (headerRow) {
            const columns = getChildren(headerRow);
            if (columns) {
              const headerEntry = columns[columnIndex];
              if (headerEntry) {
                const [header] = headerEntry;
                if (header) {
                  setCellType((cType) =>
                    dequal(cType, header.cellType) ? cType : header.cellType
                  );
                }
              }
            }
          }
        }
      }
      onChange();
    };

    editor.onChange = getCellType;

    getCellType();

    return () => {
      editor.onChange = onChange;
    };
  }, [editor, element]);

  return cellType;
};
