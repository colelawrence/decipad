import { TableCellType } from '@decipad/editor-types';
import { createContext, useContext } from 'react';

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
