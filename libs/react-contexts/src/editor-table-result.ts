import { createContext, useContext } from 'react';
import { type Result, Unknown } from '@decipad/language-interfaces';

export type EditorTableResultContextValue = Result.Result<
  'table' | 'materialized-table' | 'pending' | 'type-error'
>;

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
