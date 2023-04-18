import { useCallback, useEffect, Context } from 'react';
import { astNode, Computer, ProgramBlock, Result } from '@decipad/computer';
import { zip } from '@decipad/utils';
import { buildType, deserializeType, serializeType } from '@decipad/language';
import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { ImportResult } from '@decipad/import';
import { useCache, deserializeResult } from '@decipad/editor-utils';
import {
  ExternalDataSource,
  ExternalDataSourcesContextValue,
} from '@decipad/interfaces';
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
  beforeAuthenticate: (source: ExternalDataSource) => Promise<void>;
}

export const useLiveConnection = (
  computer: Computer,
  {
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
  }: LiveConnectionProps
): LiveConnectionResult => {
  const [jsonPath] = useDebounce(_jsonPath, 2000);

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
  });

  const [result, clearCache] = useCache<ImportResult | undefined>({
    blockId,
    deleted,
    value: liveConnectionResult,
    deserialize: useCallback(
      (importRes) =>
        importRes && {
          ...importRes,
          result: deserializeResult(importRes.result),
        },
      []
    ),
  });

  useEffect(() => {
    const computerResult = result?.result;
    pushResultToComputer(computer, blockId, variableName, computerResult);
  }, [blockId, computer, variableName, result]);

  useEffect(() => {
    return () => {
      pushResultToComputer(computer, blockId, variableName, undefined);
    };
  }, [computer, blockId, variableName]);

  const clearCacheAndRetry = useCallback(() => {
    clearCache();
    retry();
  }, [clearCache, retry]);

  // Authentication
  const { authenticate } = useLiveConnectionAuth({
    provider: source,
    externalId: url,
    context: externalDataSourceContext,
    beforeAuthenticate,
  });

  return {
    error,
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
    retry: clearCacheAndRetry,
    authenticate,
  };
};

/** Inject a table into the computer so the rest of the notebook can read it */
export function pushResultToComputer(
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
    if (computerResult.type.kind === 'table') {
      const { type, value } = computerResult as Result.Result<'table'>;

      const externalDatas = [] as [string, Result.Result][];
      const programBlocks: ProgramBlock[] = [
        // Table = {}
        {
          type: 'identified-block',
          id: blockId,
          block: {
            id: blockId,
            type: 'block',
            args: [astNode('table', astNode('tabledef', variableName))],
          },
          definesVariable: variableName,
        },
      ];

      for (const [index, [colName, colType]] of zip(
        type.columnNames,
        type.columnTypes
      ).entries()) {
        const dataRef = `${blockId}--${index}`;

        // Table.Column = {Data}
        programBlocks.push({
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
        });

        // the {Data} for the thing above
        externalDatas.push([
          dataRef,
          {
            type: serializeType(
              buildType.column(deserializeType(colType), variableName, index)
            ),
            value: value[index],
          },
        ]);
      }

      computer.pushExternalDataUpdate(blockId, externalDatas);
      computer.pushExtraProgramBlocks(blockId, programBlocks);
    } else {
      computer.pushExternalDataUpdate(blockId, [
        [
          blockId,
          {
            type: serializeType(computerResult.type),
            value: computerResult.value,
          },
        ],
      ]);
      computer.pushExtraProgramBlocks(blockId, [
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
      ]);
    }
  } else {
    computer.pushExternalDataDelete(blockId);
    computer.pushExtraProgramBlocksDelete(blockId);
  }
}
