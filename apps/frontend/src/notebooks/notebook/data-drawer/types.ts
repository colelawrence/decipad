import { Computer } from '@decipad/computer-interfaces';
import { CodeLineV2Element } from '@decipad/editor-types';
import { createContext, useContext } from 'react';

export type DataDrawerEditorValue = [CodeLineV2Element];

export const DataDrawerContext = createContext<{ computer: Computer }>({
  computer: {} as any,
});

export const useDataDrawerContext = () => useContext(DataDrawerContext);
