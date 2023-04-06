import { useEffect } from 'react';
import { useTPlateSelectors } from '@decipad/editor-types';

export const CodeVariableDefinitionEffects = ({
  onEditorChange,
}: {
  onEditorChange: () => void;
}) => {
  const keyEditor = useTPlateSelectors().keyEditor();

  useEffect(() => {
    onEditorChange();
  }, [keyEditor, onEditorChange]);

  return null;
};
