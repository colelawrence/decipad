import { useCallback, useMemo } from 'react';
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
import { useSyncLiveConnectionResultToContext } from './useSyncLiveConnectionResultToContext';
import { useLiveConnectionPersistResult } from './useLiveConnectionPersistResult';
import { useLiveConnectionStore } from '../store/liveConnectionStore';
import { useCoreLiveConnectionActions } from './useCoreLiveConnectionActions';
import { useSyncLiveConnectionMetadata } from './useSyncLiveConnectionMetadata';

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
  const { error, result, retry, authenticate } = useLiveConnection(computer, {
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
  useSyncLiveConnectionMetadata({ path, element, result });
  useLiveConnectionPersistResult({ element, result, error });
  useSyncLiveConnectionResultToContext({ element });
  const [, store] = useLiveConnectionStore(element);

  const clearCacheAndRetry = useCallback(() => {
    store({ result: undefined, error: undefined, loading: false });
    retry();
  }, [retry, store]);

  return useMemo(
    () => ({
      authenticate,
      error,
      result: result.result,
      loading: result.loading ?? false,
      onChangeColumnType,
      setIsFirstRowHeader,
      clearCacheAndRetry,
    }),
    [
      authenticate,
      clearCacheAndRetry,
      error,
      onChangeColumnType,
      result.loading,
      result.result,
      setIsFirstRowHeader,
    ]
  );
};
