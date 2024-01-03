import { createContext, useContext } from 'react';
import { Result, Unknown } from '@decipad/remote-computer';

export type EditorTableResultContextValue =
  | Result.Result<'materialized-table'>
  | Result.Result<'pending'>;

export const defaultTableResultValue: Result.Result<'pending'> = {
  type: {
    kind: 'pending',
  },
  value: Unknown,
};

export const EditorTableResultContext =
  createContext<EditorTableResultContextValue>(defaultTableResultValue);

export const useEditorTableResultContext =
  (): EditorTableResultContextValue => {
    return useContext(EditorTableResultContext);
  };
