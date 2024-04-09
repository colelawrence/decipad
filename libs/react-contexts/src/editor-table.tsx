import { noop } from '@decipad/utils';
import { createContext, useContext } from 'react';
import type { CellValueType } from '@decipad/editor-types';

export type EditorTableContextValue = Readonly<{
  blockId: string;
  cellTypes: CellValueType[];
  columnBlockIds: string[];
  tableFrozen: boolean;
  setTableFrozen: (_b: boolean) => void;
}>;

const defaultValue: EditorTableContextValue = {
  blockId: '',
  cellTypes: [],
  columnBlockIds: [],
  tableFrozen: false,
  setTableFrozen: noop,
};

export const EditorTableContext =
  createContext<EditorTableContextValue>(defaultValue);

export const useEditorTableContext = (): EditorTableContextValue => {
  return useContext(EditorTableContext);
};
