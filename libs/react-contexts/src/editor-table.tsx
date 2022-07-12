import { createContext, useContext } from 'react';
import type { TableCellType } from '../../editor-types/src';

export type EditorTableContextValue = Readonly<{
  blockId: string;
  cellTypes: TableCellType[];
}>;

const defaultValue = {
  blockId: '',
  cellTypes: [],
};

export const EditorTableContext =
  createContext<EditorTableContextValue>(defaultValue);

export const useEditorTableContext = (): EditorTableContextValue => {
  return useContext(EditorTableContext);
};
