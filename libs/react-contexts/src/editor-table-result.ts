import { createContext, useContext } from 'react';
import { Result } from '@decipad/remote-computer';

export type EditorTableResultContextValue =
  | Result.Result<'materialized-table'>
  | Result.Result<'pending'>;

export const defaultTableResultValue: Result.Result<'pending'> = {
  type: {
    kind: 'pending',
  },
  value: Result.Unknown,
};

export const EditorTableResultContext =
  createContext<EditorTableResultContextValue>(defaultTableResultValue);

export const useEditorTableResultContext =
  (): EditorTableResultContextValue => {
    return useContext(EditorTableResultContext);
  };
