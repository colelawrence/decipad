import { useCallback, useEffect, Context } from 'react';
import { astNode, Computer, ProgramBlock } from '@decipad/computer';
import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { ImportResult } from '@decipad/import';
import { useCache } from '@decipad/editor-utils';
import {
  ExternalDataSource,
  ExternalDataSourcesContextValue,
} from '@decipad/interfaces';
import { useDebounce } from 'use-debounce';
import { useLiveConnectionResponse } from './useLiveConnectionResponse';
import { useLiveConnectionAuth } from './useLiveConnectionAuth';
import { deserializeImportResult } from './utils/deserializeImportResult';

export interface LiveConnectionResult {
  error?: Error;
  result?: ImportResult;
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
    useFirstRowAsHeader,
    columnTypeCoercions,
    maxCellCount,
  });

  const [result, clearCache] = useCache({
    blockId,
    deleted,
    value: liveConnectionResult,
    deserialize: deserializeImportResult,
  });

  useEffect(() => {
    const computerResult = result?.result;
    if (
      computerResult?.value != null &&
      typeof computerResult.value !== 'symbol'
    ) {
      computer.pushExternalDataUpdate(blockId, computerResult);

      const programBlocks: ProgramBlock[] = [
        // Table = {computerResult pushed above}
        // TODO one per column so they all have IDs
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
          definesVariable: variableName,
        },
      ];
      computer.pushExtraProgramBlocks(blockId, programBlocks);
    } else {
      computer.pushExternalDataDelete(blockId);
      computer.pushExtraProgramBlocksDelete(blockId);
    }
  }, [blockId, computer, variableName, result]);

  useEffect(() => {
    return () => {
      computer.pushExternalDataDelete(blockId);
      computer.pushExtraProgramBlocksDelete(blockId);
    };
  }, [computer, blockId]);

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

  return { error, result, retry: clearCacheAndRetry, authenticate };
};
