import { getAnalytics } from '@decipad/client-events';
import { Result } from '@decipad/computer';
import { useNodePath } from '@decipad/editor-hooks';
import {
  LiveQueryElement,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { pluginStore } from '@decipad/editor-utils';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import {
  componentCssVars,
  grey700,
  LiveConnectionResult,
  LiveError,
  p13Bold,
  Spinner,
  Tooltip,
  transparency,
  UpgradePlanWarningTooltip,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { setNodes } from '@udecode/plate';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from '../hooks/useLiveQuery';

export interface LiveConnectionCoreProps {
  element: LiveQueryElement;
  deleted: boolean;
  showLiveQueryResults?: boolean;
}

export interface StoreResult {
  result?: Result.Result;
  error?: string;
}

const createStore = () => new WeakMap<LiveQueryElement, StoreResult>();

export const LiveQueryCore: FC<LiveConnectionCoreProps> = ({
  element,
  showLiveQueryResults = false,
}) => {
  const editor = useTEditorRef();
  const path = useNodePath(element);

  const liveQuery = useLiveQuery({
    element,
  });
  const { runQuery, status } = liveQuery;

  const onChangeColumnType = useCallback(
    (columnIndex: number, type?: TableCellType) => {
      if (path) {
        setNodes<LiveQueryElement>(
          editor,
          {
            columnTypeCoercions: {
              ...element.columnTypeCoercions,
              [columnIndex]: type,
            },
          },
          { at: path }
        );
      }
    },
    [editor, element.columnTypeCoercions, path]
  );

  // persist results

  const store = useMemo(
    () => pluginStore(editor, 'PLUGIN_LIVE_QUERY_COMPONENT', createStore),
    [editor]
  );

  const [, setVersion] = useState(0);
  const { workspaceInfo, setCurrentWorkspaceInfo, isQuotaLimitBeingReached } =
    useCurrentWorkspaceStore();
  const { quotaLimit, queryCount } = workspaceInfo;
  const [, updateQueryExecCount] = useIncrementQueryCountMutation();
  const [maxQueryExecution, setMaxQueryExecution] = useState(false);

  const updateQueryExecutionCount = useCallback(async () => {
    return updateQueryExecCount({
      id: workspaceInfo.id || '',
    });
  }, [workspaceInfo.id, updateQueryExecCount]);

  useEffect(() => {
    if (quotaLimit && queryCount) {
      setMaxQueryExecution(quotaLimit <= queryCount);
    }
  }, [queryCount, quotaLimit]);

  useEffect(() => {
    const { error, result } = liveQuery;
    if (!error && !result) {
      return;
    }
    const persistedResult = store.get(element);
    if (status === 'success' && persistedResult?.result !== result) {
      store.set(element, { result, error: undefined });
      setVersion((v) => v + 1);
    } else if (status === 'error' && persistedResult?.error !== error) {
      store.set(element, {
        result: undefined,
        error,
      });
      setVersion((v) => v + 1);
    }
  }, [element, liveQuery, status, store]);

  const {
    result: persistedResult = liveQuery.status === 'success'
      ? liveQuery.result
      : undefined,
    error: persistedError = liveQuery.status === 'error'
      ? liveQuery.error
      : undefined,
  } = store.get(element) ?? {};

  const clearCacheAndRetry = useCallback(() => {
    store.set(element, { result: undefined, error: undefined });
    setVersion((v) => v + 1);
    runQuery();
  }, [element, runQuery, store]);

  const onRunQuery = async () => {
    const analytics = getAnalytics();
    if (analytics) {
      analytics.track('run live query', { prompt });
    }
    const result = await updateQueryExecutionCount();
    const newExecutedQueryData = result.data?.incrementQueryCount;
    const errors = result.error?.graphQLErrors;
    const limitExceededError = errors?.find(
      (err) => err.extensions.code === 'LIMIT_EXCEEDED'
    );

    if (newExecutedQueryData) {
      runQuery();
      setCurrentWorkspaceInfo({
        ...workspaceInfo,
        queryCount: newExecutedQueryData.queryCount,
        quotaLimit: newExecutedQueryData.quotaLimit,
      });
    } else if (limitExceededError) {
      setMaxQueryExecution(true);
    }
  };

  const runQueryButton = (
    <button
      onClick={onRunQuery}
      css={buttonStyles}
      disabled={maxQueryExecution}
    >
      Run Query
    </button>
  );

  return (
    <div contentEditable={false}>
      {maxQueryExecution || isQuotaLimitBeingReached ? (
        <Tooltip trigger={runQueryButton} side="top">
          <UpgradePlanWarningTooltip
            workspaceId={workspaceInfo.id}
            quotaLimit={quotaLimit}
            maxQueryExecution={maxQueryExecution}
            showQueryQuotaLimit={isQuotaLimitBeingReached}
            featureCustomText="Unlock this feature"
          ></UpgradePlanWarningTooltip>
        </Tooltip>
      ) : (
        runQueryButton
      )}
      {persistedResult && (
        <LiveConnectionResult
          result={persistedResult}
          onChangeColumnType={onChangeColumnType}
          element={element}
          showLiveQueryResults={showLiveQueryResults}
        ></LiveConnectionResult>
      )}
      {persistedError ? (
        <LiveError
          error={new Error(persistedError)}
          errorURL={'/docs/'}
          onRetry={clearCacheAndRetry}
        />
      ) : null}
      {status === 'loading' && (
        <div>
          <Spinner />
        </div>
      )}
    </div>
  );
};

// Sorry for the duplication but native <button> events are not passed into our Button component
const buttonStyles = css(p13Bold, {
  padding: '8px 14px',
  backgroundColor: componentCssVars('ButtonTertiaryDefaultBackground'),
  color: componentCssVars('ButtonTertiaryDefaultText'),
  ':hover, :focus': {
    backgroundColor: componentCssVars('ButtonTertiaryHoverBackground'),
    color: componentCssVars('ButtonTertiaryHoverText'),
  },
  ':disabled': {
    backgroundColor: componentCssVars('ButtonTertiaryDisabledBackground'),
    color: componentCssVars('ButtonTertiaryDisabledText'),
    cursor: 'not-allowed',
  },
  borderRadius: '6px',
  boxShadow: `0px 1px 12px -4px ${transparency(grey700, 0.04).rgba}`,
});
