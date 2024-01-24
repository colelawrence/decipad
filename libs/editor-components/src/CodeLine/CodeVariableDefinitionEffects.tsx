import { useEffect } from 'react';
import { usePlateSelectors } from '@udecode/plate-common';

export const CodeVariableDefinitionEffects = ({
  onEditorChange,
}: {
  onEditorChange: () => void;
}) => {
  const versionEditor = usePlateSelectors().versionEditor();

  useEffect(() => {
    onEditorChange();
  }, [versionEditor, onEditorChange]);

  return null;
};
