import { createContext, useContext } from 'react';

export type EditorStylesContextValue = Readonly<{
  color: string;
}>;

const defaultValue: EditorStylesContextValue = {
  color: 'Sulu',
};

export const EditorStylesContext =
  createContext<EditorStylesContextValue>(defaultValue);

export const useEditorStylesContext = (): EditorStylesContextValue => {
  return useContext(EditorStylesContext);
};
