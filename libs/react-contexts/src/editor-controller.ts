import { MinimalRootEditorWithEventsAndTabs } from '@decipad/editor-types';
import { createContext, useContext } from 'react';

export const ControllerProvider = createContext<
  MinimalRootEditorWithEventsAndTabs | undefined
>(undefined);

export const useEditorController = () => {
  const controller = useContext(ControllerProvider);
  if (!controller) {
    throw new Error('useController must be used within a ControllerProvider');
  }
  return controller;
};
