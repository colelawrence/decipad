import { CodeLineV2Element } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { createContext, useContext } from 'react';

export type DataDrawerEditorValue = [CodeLineV2Element];

export const DataDrawerCreatingCallback = createContext<() => void>(noop);
export const useDataDrawerCreatingCallback = () =>
  useContext(DataDrawerCreatingCallback);
