import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { useNotebookRoute } from '@decipad/routing';

export const useIsReadOnlyPermission = (): boolean => {
  const { notebookId } = useNotebookRoute();

  const [{ data: notebookMetadaData }] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  return notebookMetadaData?.getPadById?.myPermissionType === 'READ';
};
