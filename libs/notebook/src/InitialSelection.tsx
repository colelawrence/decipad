import type { MyEditor } from '@decipad/editor-types';
import type { FC } from 'react';
import { useInitialSelection } from './useInitialSelection';

interface InitialSelectionProps {
  notebookId: string;
  loaded: boolean;
  editor?: MyEditor;
}

export const InitialSelection: FC<InitialSelectionProps> = ({
  notebookId,
  editor,
  loaded,
}) => {
  useInitialSelection(notebookId, loaded, editor);

  return <></>;
};
