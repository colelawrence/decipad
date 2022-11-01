import { AvailableSwatchColor } from '@decipad/ui';
import { createContext, useContext } from 'react';

interface VariableEditorContextValue {
  color?: AvailableSwatchColor;
}

export const VariableEditorContext = createContext<VariableEditorContextValue>(
  {}
);
export const useVariableEditorContext = (): VariableEditorContextValue =>
  useContext(VariableEditorContext);

export const VariableEditorContextProvider = VariableEditorContext.Provider;
