import { useEffect, useMemo } from 'react';
import { getNodeString } from '@udecode/plate';
import {
  LiveConnectionElement,
  LiveDataSetElement,
  MAX_IMPORT_CELL_COUNT,
  SubscriptionPlan,
  TableCellType,
} from '@decipad/editor-types';
import { useNodePath } from '@decipad/editor-hooks';
import { useLiveConnection } from '@decipad/live-connect';
import {
  useComputer,
  ExternalDataSourceContext,
  useCurrentWorkspaceStore,
} from '@decipad/react-contexts';
import { Result } from '@decipad/computer';
import { useCoreLiveConnectionActions } from './useCoreLiveConnectionActions';
import { useSyncLiveConnectionMetadata } from './useSyncLiveConnectionMetadata';
import { useLiveConnectionResult$ } from '../contexts/LiveConnectionResultContext';

interface UseLiveConnectionCoreProps {
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
  element,
  deleted,
}: UseLiveConnectionCoreProps): UseLiveConnectionCoreResult => {
  const computer = useComputer();
  const path = useNodePath(element);

  const { workspaceInfo } = useCurrentWorkspaceStore();
  const plan: SubscriptionPlan = workspaceInfo.isPremium ? 'pro' : 'free';
  const { onChangeColumnType, setIsFirstRowHeader, beforeAuthenticate } =
    useCoreLiveConnectionActions({
      path,
      element,
    });
  const liveConnectionResult = useLiveConnection(computer, {
    blockId: element.id,
    variableName: getNodeString(element.children[0]),
    url: element.url,
    proxy: element.proxy,
    source: element.source,
    useFirstRowAsHeader: element.isFirstRowHeaderRow,
    columnTypeCoercions: element.columnTypeCoercions,
    jsonPath: element.jsonPath,
    delimiter: element.delimiter,
    maxCellCount: MAX_IMPORT_CELL_COUNT[plan],
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
