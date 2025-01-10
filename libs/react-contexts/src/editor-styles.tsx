import { AvailableSwatchColor, NumberFormatting } from '@decipad/editor-types';
import { createContext, useContext } from 'react';

export type EditorStylesContextValue = Readonly<{
  color: AvailableSwatchColor;
  numberFormatting: NumberFormatting;
}>;

const defaultValue: EditorStylesContextValue = {
  color: 'Catskill',
  numberFormatting: 'automatic',
};

export const EditorStylesContext =
  createContext<EditorStylesContextValue>(defaultValue);

export const useEditorStylesContext = (): EditorStylesContextValue => {
  return useContext(EditorStylesContext);
};
