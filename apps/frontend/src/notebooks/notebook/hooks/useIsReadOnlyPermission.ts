import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { useNotebookRoute } from '@decipad/routing';

export const useIsReadOnlyPermission = (): boolean => {
  const { notebookId } = useNotebookRoute();

  const [{ data: notebookMetaData }] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  return notebookMetaData?.getPadById?.myPermissionType === 'READ';
};
