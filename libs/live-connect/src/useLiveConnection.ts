import type { Context } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { Computer } from '@decipad/computer-interfaces';
import type { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';
import {
  astNode,
  buildType,
  deserializeType,
  serializeType,
  isTableResult,
  Unknown,
} from '@decipad/remote-computer';
import type { ProgramBlock, Result } from '@decipad/remote-computer';
import type { PromiseOrType } from '@decipad/utils';
import { zip } from '@decipad/utils';
import type {
  ColIndex,
  ImportElementSource,
  LiveQueryElement,
  TableCellType,
} from '@decipad/editor-types';
import type { ImportResult } from '@decipad/import';
import type { ExternalDataSourcesContextValue } from '@decipad/interfaces';
import { useDebounce } from 'use-debounce';
import { useLiveConnectionResponse } from './useLiveConnectionResponse';
import { useLiveConnectionAuth } from './useLiveConnectionAuth';

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

/**
 * Inject a table into the computer so the rest of the notebook can read isTableResult
 * Pass `computerResult` as `undefined` if you want to erase the result.
 */
export async function pushResultToComputer(
  computer: Computer,
  blockId: string,
  variableName: string,
  computerResult: Result.Result | undefined
) {
  if (
    computerResult?.type &&
    computerResult?.value != null &&
    typeof computerResult.value !== 'symbol'
  ) {
    if (isTableResult(computerResult)) {
      const { type, value } = computerResult as Result.Result<
        'table' | 'materialized-table'
      >;

      const externalDatas: Map<string, Result.Result> = new Map();
      const programBlocks: Map<string, ProgramBlock[]> = new Map([
        [
          blockId,
          // Table = {}
          [
            {
              type: 'identified-block',
              id: blockId,
              block: {
                id: blockId,
                type: 'block',
                args: [astNode('table', astNode('tabledef', variableName))],
              },
              definesVariable: variableName,
              isArtificial: true,
            },
          ],
        ],
      ]);

      for (const [index, [colName, colType]] of zip(
        type.columnNames,
        type.columnTypes
      ).entries()) {
        const dataRef = `${blockId}--${index}`;

        // Table.Column = {Data}
        programBlocks.set(dataRef, [
          {
            type: 'identified-block',
            id: dataRef,
            block: {
              id: dataRef,
              type: 'block',
              args: [
                astNode(
                  'table-column-assign',
                  astNode('tablepartialdef', variableName),
                  astNode('coldef', colName),
                  astNode('externalref', dataRef)
                ),
              ],
            },
            definesTableColumn: [variableName, colName],
            isArtificial: true,
            artificiallyDerivedFrom: [blockId],
          },
        ]);

        // the {Data} for the thing above
        externalDatas.set(dataRef, {
          type: serializeType(
            buildType.column(deserializeType(colType), variableName, index)
          ),
          value: value[index],
        });
      }

      await computer.pushComputeDelta({
        external: { upsert: externalDatas },
        extra: { upsert: programBlocks },
      });
    } else {
      const externalRef = `${blockId}-external`;
      await computer.pushComputeDelta({
        external: {
          upsert: {
            [externalRef]: {
              type: serializeType(computerResult.type),
              value: computerResult.value,
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
                        astNode('externalref', externalRef)
                      ),
                    ],
                  },
                  isArtificial: true,
                },
              ],
            ],
          ]),
        },
      });
    }
  } else {
    await computer.pushComputeDelta({
      external: { remove: [`${blockId}-external`] },
      extra: { remove: [blockId] },
    });
  }
}
