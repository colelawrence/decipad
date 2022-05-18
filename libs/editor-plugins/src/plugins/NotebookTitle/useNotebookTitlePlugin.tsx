import { useMutation, useQuery } from '@apollo/client';
import { useToast } from '@decipad/toast';
import {
  GET_PAD_BY_ID,
  GetPadById,
  GetPadByIdVariables,
  RENAME_PAD,
  RenamePad,
  RenamePadVariables,
} from '@decipad/queries';
import {
  getNodeEntry,
  getNodeString,
  hasNode,
  isCollapsed,
} from '@udecode/plate';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MyOnChange, MyPlatePlugin } from '@decipad/editor-types';

export interface UseNotebookTitlePluginProps {
  notebookId: string;
  readOnly: boolean;
}

const DEBOUNCE_TITLE_UPDATE_MS = 1000;

export const useNotebookTitlePlugin = ({
  notebookId,
  readOnly,
}: UseNotebookTitlePluginProps): MyPlatePlugin => {
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
  const onChangeNotebookTitle: MyOnChange = useCallback(
    (editor) => () => {
      if (!readOnly) {
        const { selection } = editor;
        if (!selection || !isCollapsed(selection)) {
          return; // early
        }
        const titlePath = [0, 0];
        if (hasNode(editor, titlePath)) {
          const [node] = getNodeEntry(editor, titlePath);
          const editableTitle = getNodeString(node);

          if (editableTitle) {
            setEditorTitle(editableTitle);
          }
        }
      }
    },
    [readOnly]
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
