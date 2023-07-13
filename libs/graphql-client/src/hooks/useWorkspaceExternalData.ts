import { useCallback } from 'react';
import {
  ExternalDataSourceCreateInput,
  useCreateExternalDataSourceMutation,
  useGetExternalDataSourcesWorkspaceQuery,
} from '../generated';
import { useMutationResultHandler } from '../utils/useMutationResultHandler';

export const useWorkspaceExternalData = (workspaceId: string) => {
  const [{ data: workspaceExternalData }, refetch] =
    useGetExternalDataSourcesWorkspaceQuery({
      variables: { workspaceId },
    });

  const createExternalData = useMutationResultHandler(
    useCreateExternalDataSourceMutation()[1],
    'Failed to create external data'
  );

  const add = useCallback(
    async (externalData: ExternalDataSourceCreateInput) => {
      const newExternalData = await createExternalData({
        dataSource: externalData,
      });
      refetch({ requestPolicy: 'network-only' });
      return newExternalData != null;
    },
    []
  );

  return { workspaceExternalData, add };
};
