import { MyEditor } from '@decipad/editor-types';
import { createContext, useContext } from 'react';

export type DeciEditorContextValue = MyEditor | undefined;

export const DeciEditorContext =
  createContext<DeciEditorContextValue>(undefined);

export const DeciEditorContextProvider = DeciEditorContext.Provider;

export const useDeciEditorContextProvider = (): DeciEditorContextValue =>
  useContext(DeciEditorContext);
