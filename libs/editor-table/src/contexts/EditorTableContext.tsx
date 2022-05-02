import { TableCellType } from '@decipad/editor-types';
import { createContext, useContext } from 'react';
import { DeepReadonly } from 'utility-types';

export type EditorTableContextValue = DeepReadonly<{
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
