import { getAnalytics } from '@decipad/client-events';
import type { Result } from '@decipad/remote-computer';
import { useNodePath } from '@decipad/editor-hooks';
import type {
  LiveQueryElement,
  MyEditor,
  MyValue,
  TableCellType,
} from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { pluginStore } from '@decipad/editor-utils';
import {
  componentCssVars,
  grey700,
  LiveConnectionResult,
  LiveError,
  p13Bold,
  Spinner,
  transparency,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { setNodes } from '@udecode/plate-common';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { UpgradeWarningBlock } from '@decipad/editor-components';
import {
  useCurrentWorkspaceStore,
  useResourceUsage,
} from '@decipad/react-contexts';

export interface LiveConnectionCoreProps {
  element: LiveQueryElement;
  deleted: boolean;
  showLiveQueryResults?: boolean;
}

export interface StoreResult {
  result?: Result.Result;
  error?: string;
}

export type Store = WeakMap<LiveQueryElement, StoreResult>;

const createStore = (): Store => new WeakMap();

export const LiveQueryCore: FC<LiveConnectionCoreProps> = ({
  element,
  showLiveQueryResults = false,
}) => {
  const editor = useMyEditorRef();
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
    () =>
      pluginStore<Store, MyValue, MyEditor>(
        editor,
        'PLUGIN_LIVE_QUERY_COMPONENT',
        createStore
      ),
    [editor]
  );

  const [, setVersion] = useState(0);

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

  const { queries } = useResourceUsage();
  const { workspaceInfo } = useCurrentWorkspaceStore();

  const onRunQuery = async () => {
    if (queries.hasReachedLimit) return;

    getAnalytics().then((analytics) =>
      analytics?.track('run live query', { prompt })
    );

    if (workspaceInfo.id) {
      queries.incrementUsageWithBackend(workspaceInfo.id);
    }
  };

  return (
    <div contentEditable={false}>
      <UpgradeWarningBlock
        type="queries"
        variant="tooltip"
        featureText="Unlock Refresh Data"
        fallback={
          <button
            onClick={onRunQuery}
            css={buttonStyles}
            disabled={queries.hasReachedLimit}
          >
            Run Query
          </button>
        }
      />
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
