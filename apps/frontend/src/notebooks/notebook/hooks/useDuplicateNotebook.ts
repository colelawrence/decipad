import type { MyEditor } from '@decipad/editor-types';
import { serializeDocument } from '@decipad/editor-utils';
import { notebooks } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import { useNavigate } from 'react-router-dom';
import {
  useDuplicateNotebookMutation,
  useGetWorkspacesIDsQuery,
} from '../../../graphql';

type UseDuplicateNotebookArgs = {
  readonly editor?: MyEditor;
  readonly id: string;
};

export const useDuplicateNotebook = ({
  editor,
  id,
}: UseDuplicateNotebookArgs) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [result] = useGetWorkspacesIDsQuery();
  const [, duplicateNotebook] = useDuplicateNotebookMutation();

  const { data, error } = result;

  if (error || !data) {
    throw new Error('Could not fetch workspaces');
  }

  const mutate = async () => {
    if (!editor) {
      console.error('Failed to duplicate notebook. Missing editor.');
      toast('Failed to duplicate notebook', 'error');
      return;
    }

    try {
      const { data: duplicateData, error: duplicateError } =
        await duplicateNotebook({
          id,
          targetWorkspace: data.workspaces[0].id,
          document: serializeDocument(editor),
        });

      if (duplicateError) {
        console.error('Failed to duplicate notebook. Error:', duplicateError);
        toast('Failed to duplicate notebook', 'error');
      } else if (!duplicateData) {
        console.error(
          'Failed to duplicate notebook. Received empty response.',
          duplicateError
        );
        toast('Failed to duplicate notebook.', 'error');
      } else {
        navigate(
          notebooks({}).notebook({
            notebook: duplicateData.duplicatePad,
          }).$
        );
      }
    } catch (err) {
      console.error('Failed to duplicate notebook. Error:', err);
      toast('Failed to duplicate notebook.', 'error');
    }
  };

  return [mutate];
};
