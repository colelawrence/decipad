import { NoDocSyncEditor } from '@decipad/editor';
import { NotebookPage } from '@decipad/ui';
import { FC, useEffect } from 'react';

export function Playground(): ReturnType<FC> {
  useEffect(() => {
    return () => {
      localStorage.clear();
    };
  }, []);

  return <NotebookPage notebook={<NoDocSyncEditor />} />;
}
