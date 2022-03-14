import { useMutation, useQuery } from '@apollo/client';
import {
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
  RenamePad,
  RenamePadVariables,
  RENAME_PAD,
} from '@decipad/queries';
import { isCollapsed, OnChange, PlatePlugin } from '@udecode/plate';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Editor } from 'slate';

export interface UseNotebookTitlePluginProps {
  notebookId: string;
  readOnly: boolean;
}

export const useNotebookTitlePlugin = ({
  notebookId,
  readOnly,
}: UseNotebookTitlePluginProps): PlatePlugin => {
  const { addToast } = useToasts();
  const [newTitle, setNewTitle] = useState<null | string>(null);

  // Getting the current pad's name
  const { data } = useQuery<GetPadById, GetPadByIdVariables>(GET_PAD_BY_ID, {
    variables: { id: notebookId },
  });

  const [mutate] = useMutation<RenamePad, RenamePadVariables>(RENAME_PAD);

  // Get the first node's text value, if it is not the same as the current pad's name, then i set the newTitle state
  const onChangeNotebookTitle: OnChange = useCallback(
    (editor) => () => {
      const { selection } = editor;

      // TODO fix Node types
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (selection && data && isCollapsed(selection)) {
        const [node] = Editor.node(editor, [0, 0]);
        if (data.getPadById?.name !== (node as any).text) {
          setNewTitle((node as any).text);
        }
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    },
    [data]
  );

  // Change the pad's title after the user has stopped typing by 1 second
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (newTitle !== null && !readOnly) {
        // change the title of the pad
        mutate({
          variables: { padId: notebookId, name: newTitle },
        }).then(() => {
          addToast('Notebook title updated', {
            appearance: 'info',
          });
        });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [mutate, newTitle, notebookId, addToast, readOnly]);

  // return a slate plugin
  return useMemo(
    () => ({ onChange: onChangeNotebookTitle }),
    [onChangeNotebookTitle]
  );
};
