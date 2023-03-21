import { useCallback, useEffect, Context } from 'react';
import { Computer } from '@decipad/computer';
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
  url: string;
  proxy?: string;
  options?: RequestInit;
  source?: ImportElementSource;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
  maxCellCount: number;
  deleted: boolean;
  externalDataSourceContext: Context<ExternalDataSourcesContextValue>;
  beforeAuthenticate: (source: ExternalDataSource) => Promise<void>;
}

export const useLiveConnection = (
  computer: Computer,
  {
    blockId,
    url,
    proxy,
    options,
    source,
    useFirstRowAsHeader,
    columnTypeCoercions,
    maxCellCount,
    deleted,
    beforeAuthenticate,
    externalDataSourceContext,
  }: LiveConnectionProps
): LiveConnectionResult => {
  const {
    error,
    result: liveConnectionResult,
    retry,
  } = useLiveConnectionResponse({
    url,
    proxy,
    options,
    source,
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
    } else {
      computer.pushExternalDataDelete(blockId);
    }
  }, [blockId, computer, result]);

  useEffect(() => {
    return () => {
      computer.pushExternalDataDelete(blockId);
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
