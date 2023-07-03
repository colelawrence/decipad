import { createContext, useContext } from 'react';
import type { CellValueType } from '../../editor-types/src';

export type EditorTableContextValue = Readonly<{
  blockId: string;
  cellTypes: CellValueType[];
  columnBlockIds: string[];
  columnWidths: Array<number | undefined>;
}>;

const defaultValue = {
  blockId: '',
  cellTypes: [],
  columnBlockIds: [],
  columnWidths: [],
};

export const EditorTableContext =
  createContext<EditorTableContextValue>(defaultValue);

export const useEditorTableContext = (): EditorTableContextValue => {
  return useContext(EditorTableContext);
};
