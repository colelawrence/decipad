import { useMutation, useQuery } from '@apollo/client';
import { useToast } from '@decipad/toast';
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
  isWriter: boolean;
}

const DEBOUNCE_TITLE_UPDATE_MS = 1000;

export const useNotebookTitlePlugin = ({
  notebookId,
  isWriter,
}: UseNotebookTitlePluginProps): PlatePlugin => {
  const toast = useToast();
  const [editorTitle, setEditorTitle] = useState<string | undefined>(undefined);

  // Getting the current pad's name
  const { data, loading: remoteTitleLoading } = useQuery<
    GetPadById,
    GetPadByIdVariables
  >(GET_PAD_BY_ID, {
    variables: { id: notebookId },
  });
  const [remoteTitleNeedsUpdate, setRemoteTitleNeedsUpdate] = useState(false);
  useEffect(() => {
    if (!remoteTitleLoading) {
      const remoteTitle = data?.getPadById?.name;
      setRemoteTitleNeedsUpdate(
        remoteTitle !== undefined && remoteTitle !== editorTitle
      );
    }
  }, [data?.getPadById?.name, editorTitle, remoteTitleLoading]);

  const [renameNotebook] = useMutation<RenamePad, RenamePadVariables>(
    RENAME_PAD
  );

  // setting the new remote title
  const setRemoteTitle = useCallback(
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
      if (remoteTitleNeedsUpdate && editorTitle !== undefined) {
        setRemoteTitle(editorTitle).catch((err) => {
          console.error(err);
          toast('Error updating title', 'error');
        });
      }
    }, DEBOUNCE_TITLE_UPDATE_MS);
    return () => clearTimeout(timeout);
  }, [editorTitle, remoteTitleNeedsUpdate, setRemoteTitle, toast]);

  // Get the first node's text value, if it is not the same as the current pad's name, then i set the newTitle state
  const onChangeNotebookTitle: OnChange = useCallback(
    (editor) => () => {
      if (isWriter) {
        const { selection } = editor;
        if (!selection || !isCollapsed(selection)) {
          return; // early
        }
        const titlePath = [0, 0];
        if (Editor.hasPath(editor, titlePath)) {
          const [node] = Editor.node(editor, titlePath);
          const editableTitle = Node.string(node);

          if (editableTitle) {
            setEditorTitle(editableTitle);
          }
        }
      }
    },
    [isWriter]
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
