import { createContext, useContext } from 'react';

export type TabEditorContextValue = Readonly<{
  tabIndex: number;
}>;

const defaultValue: TabEditorContextValue = {
  tabIndex: -1,
};

export const TabEditorContext =
  createContext<TabEditorContextValue>(defaultValue);

export const useTabEditorContext = (): TabEditorContextValue => {
  return useContext(TabEditorContext);
};
