import { MyEditor } from '@decipad/editor-types';
import { FC } from 'react';
import { useInitialSelection } from './useInitialSelection';

interface InitialSelectionProps {
  loaded: boolean;
  editor: MyEditor;
}

export const InitialSelection: FC<InitialSelectionProps> = ({
  editor,
  loaded,
}) => {
  useInitialSelection(loaded, editor);

  return <></>;
};
