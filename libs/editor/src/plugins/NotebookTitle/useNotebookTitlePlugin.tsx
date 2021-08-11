import { useMutation, useQuery } from '@apollo/client';
import {
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
  RenamePad,
  RenamePadVariables,
  RENAME_PAD,
} from '@decipad/queries';
import { isCollapsed, OnChange } from '@udecode/plate';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Editor } from 'slate';

export interface UseNotebookTitlePluginProps {
  padId: string;
}

export const useNotebookTitlePlugin = ({
  padId,
}: UseNotebookTitlePluginProps) => {
  const { addToast } = useToasts();
  const [newTitle, setNewTitle] = useState<null | string>(null);

  // Getting the current pad's name
  const { data } = useQuery<GetPadById, GetPadByIdVariables>(GET_PAD_BY_ID, {
    variables: { id: padId },
  });

  const [mutate] = useMutation<RenamePad, RenamePadVariables>(RENAME_PAD);

  // Get the first node's text value, if it is not the same as the current pad's name, then i set the newTitle state
  const onChangeNotebookTitle: OnChange = useCallback(
    (editor) => () => {
      const { selection } = editor;

      if (selection && data && isCollapsed(selection)) {
        const [node] = Editor.node(editor, [0, 0]);
        if (data.getPadById?.name !== (node as any).text) {
          setNewTitle((node as any).text);
        }
      }
    },
    [data]
  );

  // Change the pad's title after the user has stopped typing by 1 second
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (newTitle !== null) {
        // change the title of the pad
        mutate({
          variables: { padId, name: newTitle },
        }).then(() => {
          addToast('Pad Title Updated', {
            appearance: 'info',
          });
        });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [mutate, newTitle, padId, addToast]);

  // return a slate plugin
  return {
    plugin: useMemo(
      () => ({ onChange: onChangeNotebookTitle }),
      [onChangeNotebookTitle]
    ),
  };
};
