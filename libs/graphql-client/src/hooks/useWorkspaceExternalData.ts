/* eslint-disable no-underscore-dangle */
import { useCallback } from 'react';
import {
  ExternalDataSource,
  ExternalDataSourceCreateInput,
  ExternalDataSourceUpdateInput,
  useCreateExternalDataSourceMutation,
  useDeleteExternalDataMutation,
  useGetExternalDataSourcesWorkspaceQuery,
  useUpdateExternalDataMutation,
} from '../generated';
import { useMutationResultHandler } from '../utils/useMutationResultHandler';

export const useWorkspaceExternalData = (workspaceId: string) => {
  const [{ data }, refetch] = useGetExternalDataSourcesWorkspaceQuery({
    variables: { workspaceId },
  });

  const workspaceExternalData =
    data?.getExternalDataSourcesWorkspace.items.filter(
      (x): x is ExternalDataSource => x.__typename === 'ExternalDataSource'
    );

  const createExternalData = useMutationResultHandler(
    useCreateExternalDataSourceMutation()[1],
    'Failed to create external data'
  );

  const deleteExternalData = useMutationResultHandler(
    useDeleteExternalDataMutation()[1],
    'Failed to delete external data'
  );

  const updateExternalData = useMutationResultHandler(
    useUpdateExternalDataMutation()[1],
    'Failed to update external data'
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

  const remove = useCallback(async (externalDataId: string | number) => {
    const res = await deleteExternalData({
      id: externalDataId,
    });
    refetch({ requestPolicy: 'network-only' });
    return !!res?.removeExternalDataSource;
  }, []);

  const update = useCallback(
    async (
      externalDataId: string | number,
      externalDataInput: ExternalDataSourceUpdateInput
    ) => {
      const res = await updateExternalData({
        id: externalDataId,
        dataSource: externalDataInput,
      });
      refetch({ requestPolicy: 'network-only' });
      return res?.updateExternalDataSource;
    },
    []
  );

  return { workspaceExternalData, add, remove, update };
};
