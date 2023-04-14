import { useEffect } from 'react';
import { getNodeString, insertText } from '@udecode/plate';
import { varNamify } from '@decipad/utils';
import { ImportResult } from '@decipad/import';
import { LiveConnectionElement, useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { Path } from 'slate';

interface UseSyncLiveConnectionMetadataProps {
  path?: Path;
  element: LiveConnectionElement;
  result?: ImportResult;
}

export const useSyncLiveConnectionMetadata = ({
  path,
  element,
  result,
}: UseSyncLiveConnectionMetadataProps) => {
  const editor = useTEditorRef();
  const computer = useComputer();

  // sync connection metadata title if needed
  useEffect(() => {
    if (path && result) {
      const caption = element.children[0];
      const currentTitle = getNodeString(caption);
      if (!currentTitle) {
        const newTitle = result.meta?.title || 'LiveConnection';
        insertText(
          editor,
          computer.getAvailableIdentifier(varNamify(newTitle), 1),
          { at: [...path, 0] }
        );
      }
    }
  }, [computer, editor, element.children, path, result]);
};
