import type { Context } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import type { Computer } from '@decipad/computer-interfaces';
import type { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';
// eslint-disable-next-line no-restricted-imports
import { astNode } from '@decipad/remote-computer';
import type { Result } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';
import type {
  ColIndex,
  ImportElementSource,
  LiveQueryElement,
  TableCellType,
} from '@decipad/editor-types';
import type { ImportResult } from '@decipad/import';
import type { ExternalDataSourcesContextValue } from '@decipad/interfaces';
import { useLiveConnectionResponse } from './useLiveConnectionResponse';
import { useLiveConnectionAuth } from './useLiveConnectionAuth';
import { pushResultToComputer } from '@decipad/computer-utils';

export interface LiveConnectionResult {
  error?: Error;
  result: ImportResult;
  retry: () => void;
  authenticate: () => void;
}

export interface LiveConnectionProps {
  notebookId: string;
  blockId: string;
  variableName: string;
  url: string;
  proxy?: string;
  options?: RequestInit;
  source?: ImportElementSource;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
  maxCellCount: number;
  deleted: boolean;
  jsonPath?: string;
  delimiter?: string;
  externalDataSourceContext: Context<ExternalDataSourcesContextValue>;
  beforeAuthenticate: (
    source: ExternalDataSourceFragmentFragment
  ) => PromiseOrType<void>;
  liveQuery?: LiveQueryElement;
}

const WAIT_TIMEOUT_MS = 7000;

export const useLiveConnection = (
  computer: Computer,
  {
    notebookId,
    blockId,
    variableName,
    url,
    proxy,
    options,
    source,
    useFirstRowAsHeader,
    columnTypeCoercions,
    maxCellCount,
    deleted,
    jsonPath: _jsonPath,
    delimiter,
    beforeAuthenticate,
    externalDataSourceContext,
    liveQuery,
  }: LiveConnectionProps
): LiveConnectionResult => {
  const [jsonPath] = useDebounce(_jsonPath, 2000);

  // timeout
  const [timedout, setTimedout] = useState(false);
  useEffect(() => {
    if (source === 'decipad') {
      const timeout = setTimeout(() => {
        setTimedout(true);
      }, WAIT_TIMEOUT_MS);
      return () => {
        clearTimeout(timeout);
      };
    }
    return undefined;
  }, [source]);

  const {
    error,
    result: liveConnectionResult,
    retry,
  } = useLiveConnectionResponse({
    url,
    proxy,
    options,
    source,
    jsonPath,
    delimiter,
    useFirstRowAsHeader,
    columnTypeCoercions,
    maxCellCount,
    liveQuery,
    useCache: source === 'csv', // TODO: add more?
  });

  const result = liveConnectionResult;

  useEffect(() => {
    const computerResult = result?.result;
    if (!computerResult) {
      pushPendingResultToComputer(computer, blockId, variableName);
    } else {
      pushResultToComputer(computer, blockId, variableName, computerResult);
    }
  }, [blockId, computer, result, variableName]);

  useEffect(() => {
    if (deleted) {
      pushResultToComputer(computer, blockId, variableName, undefined);
    }
  }, [blockId, computer, deleted, variableName]);

  const doRetry = useCallback(() => {
    setTimedout(false);
    retry();
  }, [retry]);

  // Authentication
  const { authenticate } = useLiveConnectionAuth({
    notebookId,
    provider: source,
    externalId: url,
    context: externalDataSourceContext,
    beforeAuthenticate,
  });

  return {
    error:
      error ??
      (timedout && liveConnectionResult?.loading
        ? new Error('No result')
        : undefined),
    result: {
      ...result,
      ...liveConnectionResult,
      result:
        result?.result != null || liveConnectionResult?.result != null
          ? ({
              ...result?.result,
              ...liveConnectionResult?.result,
            } as Result.Result)
          : undefined,
      loading: liveConnectionResult?.loading || result?.loading || false,
    },
    retry: doRetry,
    authenticate,
  };
};

async function pushPendingResultToComputer(
  computer: Computer,
  blockId: string,
  variableName: string
): Promise<void> {
  return computer.pushComputeDelta({
    external: {
      upsert: {
        [blockId]: {
          type: {
            kind: 'pending',
          },
          value: Unknown,
          meta: undefined,
        },
      },
    },
    extra: {
      upsert: new Map([
        [
          blockId,
          [
            {
              type: 'identified-block',
              id: blockId,
              block: {
                id: blockId,
                type: 'block',
                args: [
                  astNode(
                    'assign',
                    astNode('def', variableName),
                    astNode('externalref', blockId)
                  ),
                ],
              },
            },
          ],
        ],
      ]),
    },
  });
}
