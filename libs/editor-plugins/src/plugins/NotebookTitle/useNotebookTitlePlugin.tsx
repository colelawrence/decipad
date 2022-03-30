import { useMutation, useQuery } from '@apollo/client';
import { useToast } from '@decipad/react-contexts';
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
import { Editor, Node } from 'slate';

export interface UseNotebookTitlePluginProps {
  notebookId: string;
  readOnly: boolean;
}

const DEBOUNCE_TITLE_UPDATE_MS = 1000;

export const useNotebookTitlePlugin = ({
  notebookId,
  readOnly,
}: UseNotebookTitlePluginProps): PlatePlugin => {
  const toast = useToast();
  const [editorTitle, setEditorTitle] = useState<string | undefined>(undefined);

  // Getting the current pad's name
  const { data } = useQuery<GetPadById, GetPadByIdVariables>(GET_PAD_BY_ID, {
    variables: { id: notebookId },
  });

  const [renameNotebook] =
    useMutation<RenamePad, RenamePadVariables>(RENAME_PAD);
  const remoteTitle = data?.getPadById?.name;

  const setNewTitle = useCallback(
    (newTitle: string) =>
      renameNotebook({
        variables: { padId: notebookId, name: newTitle },
      }).then(() => {
        toast('Notebook title updated', 'info');
      }),
    [notebookId, renameNotebook, toast]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (editorTitle && editorTitle !== remoteTitle) {
        setNewTitle(editorTitle);
      }
    }, DEBOUNCE_TITLE_UPDATE_MS);
    return () => clearTimeout(timeout);
  }, [editorTitle, remoteTitle, setNewTitle]);

  // Get the first node's text value, if it is not the same as the current pad's name, then i set the newTitle state
  const onChangeNotebookTitle: OnChange = useCallback(
    (editor) => () => {
      if (readOnly) {
        return;
      }
      const { selection } = editor;
      const titlePath = [0, 0];
      if (Editor.hasPath(editor, titlePath)) {
        const [node] = Editor.node(editor, titlePath);
        const editableTitle = Node.string(node);

        if (selection && isCollapsed(selection)) {
          if (editableTitle && remoteTitle !== editableTitle) {
            setEditorTitle(editableTitle);
          }
        }
      }
    },
    [readOnly, remoteTitle]
  );

  // return a slate plugin
  return useMemo(
    () => ({
      key: 'ON_CHANGE_NOTEBOOK_TITLE_PLUGIN',
      handlers: {
        onChange: onChangeNotebookTitle,
      },
    }),
    [onChangeNotebookTitle]
  );
};
