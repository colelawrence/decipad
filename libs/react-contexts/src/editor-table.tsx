import { noop } from '@decipad/utils';
import { createContext, useContext } from 'react';
import type { CellValueType } from '@decipad/editor-types';

export type EditorTableContextValue = Readonly<{
  blockId: string;
  cellTypes: CellValueType[];
  columnBlockIds: string[];
  tableFrozen: boolean;
  setTableFrozen: (b: boolean) => void;
  columnWidths: Array<number | undefined>;
}>;

const defaultValue: EditorTableContextValue = {
  blockId: '',
  cellTypes: [],
  columnBlockIds: [],
  tableFrozen: false,
  setTableFrozen: noop,
  columnWidths: [],
};

export const EditorTableContext =
  createContext<EditorTableContextValue>(defaultValue);

export const useEditorTableContext = (): EditorTableContextValue => {
  return useContext(EditorTableContext);
};
