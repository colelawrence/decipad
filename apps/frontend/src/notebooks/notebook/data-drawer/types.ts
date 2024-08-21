import { Computer } from '@decipad/computer-interfaces';
import { CodeLineV2Element } from '@decipad/editor-types';
import { EditorController } from '@decipad/notebook-tabs';
import { noop } from '@decipad/utils';
import { createContext, useContext } from 'react';

export type DataDrawerEditorValue = [CodeLineV2Element];

export const DataDrawerContext = createContext<{
  computer: Computer;
  controller: EditorController;
  isEditing: boolean;
}>({
  computer: {} as any,
  controller: {} as any,
  isEditing: false,
});

export const useDataDrawerContext = () => useContext(DataDrawerContext);

export const DataDrawerCreatingCallback = createContext<() => void>(noop);
export const useDataDrawerCreatingCallback = () =>
  useContext(DataDrawerCreatingCallback);
