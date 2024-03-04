import { useEffect, useMemo } from 'react';
import { getNodeString } from '@udecode/plate-common';
import {
  LiveConnectionElement,
  LiveDataSetElement,
  MAX_IMPORT_CELL_COUNT,
  TableCellType,
} from '@decipad/editor-types';
import { useNodePath } from '@decipad/editor-hooks';
import { useLiveConnection } from '@decipad/live-connect';
import {
  useComputer,
  ExternalDataSourceContext,
} from '@decipad/react-contexts';
import { Result } from '@decipad/remote-computer';
import { useCoreLiveConnectionActions } from './useCoreLiveConnectionActions';
import { useSyncLiveConnectionMetadata } from './useSyncLiveConnectionMetadata';
import { useLiveConnectionResult$ } from '../contexts/LiveConnectionResultContext';

interface UseLiveConnectionCoreProps {
  notebookId: string;
  element: LiveConnectionElement | LiveDataSetElement;
  deleted: boolean;
}

interface UseLiveConnectionCoreResult {
  loading: boolean;
  result?: Result.Result;
  authenticate: () => void;
  error?: Error;
  onChangeColumnType: (columnIndex: number, type?: TableCellType) => void;
  setIsFirstRowHeader: (isFirstRowHeader: boolean) => void;
  clearCacheAndRetry: () => void;
}

export const useLiveConnectionCore = ({
  notebookId,
  element,
  deleted,
}: UseLiveConnectionCoreProps): UseLiveConnectionCoreResult => {
  const computer = useComputer();
  const path = useNodePath(element);
  const { onChangeColumnType, setIsFirstRowHeader, beforeAuthenticate } =
    useCoreLiveConnectionActions({
      path,
      element,
    });
  const liveConnectionResult = useLiveConnection(computer, {
    notebookId,
    blockId: element.id,
    variableName: getNodeString(element.children[0]),
    url: element.url,
    proxy: element.proxy,
    source: element.source,
    useFirstRowAsHeader: element.isFirstRowHeaderRow,
    columnTypeCoercions: element.columnTypeCoercions,
    jsonPath: element.jsonPath,
    delimiter: element.delimiter,
    maxCellCount: MAX_IMPORT_CELL_COUNT,
    deleted,
    beforeAuthenticate,
    externalDataSourceContext: ExternalDataSourceContext,
  });

  const { error, result, retry, authenticate } = liveConnectionResult;

  useSyncLiveConnectionMetadata({ path, element, result });

  const result$ = useLiveConnectionResult$();
  useEffect(() => {
    result$?.next(liveConnectionResult);
  }, [liveConnectionResult, result$]);

  return useMemo(
    () => ({
      authenticate,
      error,
      result: result.result,
      loading: result.loading ?? false,
      onChangeColumnType,
      setIsFirstRowHeader,
      clearCacheAndRetry: retry,
    }),
    [
      authenticate,
      error,
      onChangeColumnType,
      result.loading,
      result.result,
      retry,
      setIsFirstRowHeader,
    ]
  );
};
