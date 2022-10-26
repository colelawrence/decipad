import { createContext, useContext } from 'react';

// DO NOT REMOVE YET, will be used in ENG-1249 (Shadow code lines)
export type EditorBubblesContextValue = Readonly<{}>;
const defaultValue: EditorBubblesContextValue = {};

export const EditorBubblesContext =
  createContext<EditorBubblesContextValue>(defaultValue);

export const useEditorBubblesContext = (): EditorBubblesContextValue => {
  return useContext(EditorBubblesContext);
};
