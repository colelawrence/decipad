import { once } from '@decipad/utils';
import { Boom } from '@hapi/boom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

const createDataLakeParser = once(() =>
  z.object({
    state: z.enum(['pending', 'ready', 'inactive']),
    connections: z
      .array(
        z.object({
          realm: z.string(),
          source: z.string(),
          state: z.enum(['pending', 'ready', 'inactive']),
          syncState: z.enum(['idle', 'syncing', 'synced', 'error']),
          lastSyncedAt: z.number().optional(),
          lastSyncError: z.string().optional(),
          sourceType: z.string(),
          displayName: z.string(),
          description: z.string(),
          icon: z.string(),
          configInstructionsMarkdown: z.string(),
          configSchema: z.object({
            type: z.enum(['object']),
            properties: z.record(z.string(), z.any()),
          }),
          config: z.any().optional(),
          syncStatus: z
            .object({
              status: z.string(),
              schedule: z.any().optional(),
              lastSyncStartedAt: z.number().optional(),
              failure: z
                .object({
                  failedAt: z.number().int(),
                  failureOrigin: z.string(),
                  failureType: z.string(),
                  message: z.string(),
                })
                .optional(),
            })
            .optional(),
        })
      )
      .optional(),
    availableConnections: z.array(
      z.object({
        sourceType: z.string(),
        displayName: z.string(),
        description: z.string(),
        icon: z.string(),
        configSchema: z.object({
          // schema for a JSON schema document
          type: z.enum(['object']),
          required: z.array(z.string()).optional(),
          properties: z.record(z.string(), z.any()),
        }),
        configInstructionsMarkdown: z.string(),
      })
    ),
  })
);

const getErrorFromResponse = async (response: Response) => {
  const responseBody = await response.json();
  return new Boom(responseBody.message, responseBody);
};

export interface UseDataLakeOptions {
  staleTimeMs?: number;
}

const CREATE_DATA_LAKE_TIMEOUT_MS = 30_000;

export const useDataLake = (
  workspaceId: string,
  { staleTimeMs }: UseDataLakeOptions = {}
) => {
  const queryKey = useMemo(() => ['data-lake', workspaceId], [workspaceId]);

  // fetch the data lake
  const {
    isLoading,
    data: dataLake,
    error: fetchDataLakeError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetch(`/api/datalakes/${workspaceId}`, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
      if (!result.ok) {
        if (result.status === 404) {
          return null;
        }
        console.error('Failed to fetch data lake', result);
        throw new Error('Failed to fetch data lake');
      }
      return createDataLakeParser().parse(await result.json());
    },
    staleTime: staleTimeMs,
  });

  const client = useQueryClient();

  // create data lake connection
  const [createDataLakeError, setCreateDataLakeError] = useState<
    Error | undefined
  >(undefined);

  const upsertDataLakeConnection = useCallback(
    async (type: string, config: unknown) => {
      try {
        setCreateDataLakeError(undefined);
        const result = await fetch(
          `/api/datalakes/${workspaceId}/connections`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              source: type,
              connectionConfig: config,
            }),
            signal: AbortSignal.timeout(CREATE_DATA_LAKE_TIMEOUT_MS),
          }
        );
        if (!result.ok) {
          const response = await getErrorFromResponse(result);
          setCreateDataLakeError(response);
          throw response;
        }
        const data = await result.json();
        client.invalidateQueries({ queryKey });
        return data;
      } catch (err) {
        setCreateDataLakeError(err as Error);
        throw err;
      }
    },
    [workspaceId, client, queryKey]
  );

  // check data lake connection
  const [checkDataLakeConnectionError, setCheckDataLakeConnectionError] =
    useState<Error | undefined>(undefined);

  const checkConnection = useCallback(
    async (type: string) => {
      try {
        setCheckDataLakeConnectionError(undefined);
        const result = await fetch(
          `/api/datalakes/${workspaceId}/connections/${type}/health`,
          {
            method: 'GET',
            signal: AbortSignal.timeout(CREATE_DATA_LAKE_TIMEOUT_MS),
          }
        );
        if (!result.ok) {
          throw await getErrorFromResponse(result);
        }
      } catch (err) {
        setCheckDataLakeConnectionError(err as Error);
        throw err;
      }
    },
    [workspaceId]
  );

  return {
    dataLake: dataLake ?? undefined,
    isLoading,
    error:
      fetchDataLakeError ?? createDataLakeError ?? checkDataLakeConnectionError,
    queryKey,
    createDataLakeConnection: upsertDataLakeConnection,
    updateDataLakeConnection: upsertDataLakeConnection,
    checkConnection,
  };
};
