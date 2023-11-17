import { MinimalRootEditorWithEventsAndTabs } from '@decipad/editor-types';
import { createContext } from 'react';

export const ControllerProvider = createContext<
  MinimalRootEditorWithEventsAndTabs | undefined
>(undefined);
