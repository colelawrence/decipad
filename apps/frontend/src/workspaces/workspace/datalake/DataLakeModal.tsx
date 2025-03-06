import { FC, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Boom } from '@hapi/boom';
import { DataLakeModal as DataLakeModalUI } from '@decipad/ui';
import { fetch } from '@decipad/fetch';
import { useToast } from '@decipad/toast';
import { useDataLake } from '@decipad/editor-integrations';

interface DataLakeModalProps {
  closeAction: () => void;
  workspaceId: string;
  newConnectionAction: (connection: string) => Promise<unknown>;
  editConnectionAction: (connection: string) => Promise<unknown>;
}

const DATA_LAKE_STALE_TIME_MS = 1000 * 5; // 5 seconds

/**
 * TODO:
 * One of the UX issues is that the first sync can take a long time,
 * and so these views will only be available after the first sync finishes.
 * That's why I put the state of the sync in the UI.
 * But I think we may need to check that when the user tries to use the datalake query block.
 * If the datalake is not ready, we should show a message to the user that the datalake is not ready yet.
 */

export const DataLakeModal: FC<DataLakeModalProps> = ({
  closeAction,
  workspaceId,
  newConnectionAction,
  editConnectionAction,
}) => {
  const { dataLake, isLoading, error, queryKey } = useDataLake(workspaceId, {
    staleTimeMs: DATA_LAKE_STALE_TIME_MS,
  });
  const queryClient = useQueryClient();

  const { mutateAsync: createDataLake, error: createDataLakeError } =
    useMutation({
      mutationFn: async () => {
        const result = await fetch(`/api/datalakes/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workspaceId,
          }),
          signal: AbortSignal.timeout(30_000),
        });
        if (!result.ok) {
          const response = (await result.json()) as Boom;
          throw new Error(`Failed to create data lake: ${response.message}`);
        }
        queryClient.invalidateQueries({ queryKey });
      },
    });

  const toast = useToast();

  useEffect(() => {
    if (error || createDataLakeError) {
      console.error('error', error, createDataLakeError);
      toast.error((error || createDataLakeError)?.message ?? 'Unknown error');
    }
  }, [createDataLakeError, error, toast]);

  const createDataLakeAction = useCallback(async () => {
    try {
      await createDataLake();
    } catch (err) {
      console.error('error', err);
      toast.error((err as Error).message ?? 'Unknown error');
    }
  }, [createDataLake, toast]);

  return (
    <DataLakeModalUI
      error={error}
      closeAction={closeAction}
      newConnectionAction={newConnectionAction}
      createDataLakeAction={createDataLakeAction}
      editConnectionAction={editConnectionAction}
      isLoading={isLoading}
      dataLake={dataLake}
    />
  );
};
