import { useState, FC, useCallback, useEffect } from 'react';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { getAnalytics } from '@decipad/client-events';
import { p13Regular, UpgradePlanWarning } from '@decipad/ui';
import { css } from '@emotion/react';
import { useRdFetch } from './hooks';
import {
  AIPanelSuggestion,
  AIPanelForm,
  AIPanelTitle,
  AIPanelContainer,
} from './components';

type LiveQueryAIPanelProps = {
  id: string;
  updateQueryText: (s: string) => void;
  toggle: () => void;
};

export const LiveQueryAIPanel: FC<LiveQueryAIPanelProps> = ({
  id,
  updateQueryText,
  toggle,
}) => {
  const [prompt, setPrompt] = useState('');
  const [rd, fetch] = useRdFetch(`generate-sql`);
  const {
    workspaceInfo,
    setCurrentWorkspaceInfo,
    isQuotaLimitBeingReached,
    nrQueriesLeft,
  } = useCurrentWorkspaceStore();
  const { quotaLimit, queryCount } = workspaceInfo;
  const [, updateQueryExecCount] = useIncrementQueryCountMutation();
  const [maxQueryExecution, setMaxQueryExecution] = useState(false);

  useEffect(() => {
    if (queryCount && quotaLimit) {
      setMaxQueryExecution(quotaLimit <= queryCount);
    }
  }, [quotaLimit, queryCount]);

  const updateQueryExecutionCount = useCallback(async () => {
    return updateQueryExecCount({
      id: workspaceInfo.id || '',
    });
  }, [workspaceInfo.id, updateQueryExecCount]);

  const handleSubmit = useCallback(async () => {
    const analytics = getAnalytics();
    if (analytics) {
      analytics.track('submit AI live query', { prompt });
    }
    const result = await updateQueryExecutionCount();
    const newExecutedQueryData = result.data?.incrementQueryCount;
    const errors = result.error?.graphQLErrors;
    const limitExceededError = errors?.find(
      (err) => err.extensions.code === 'LIMIT_EXCEEDED'
    );

    if (newExecutedQueryData) {
      fetch({ externalDataSourceId: id, prompt });
      setCurrentWorkspaceInfo({
        ...workspaceInfo,
        queryCount: newExecutedQueryData.queryCount,
        quotaLimit: newExecutedQueryData.quotaLimit,
      });
    } else if (limitExceededError) {
      setMaxQueryExecution(true);
    }
  }, [
    fetch,
    prompt,
    setCurrentWorkspaceInfo,
    updateQueryExecutionCount,
    workspaceInfo,
    id,
  ]);
  const makeUseOfSuggestion = useCallback(
    (s: string) => {
      toggle();
      updateQueryText(s);
    },
    [toggle, updateQueryText]
  );
  if (!id) {
    return null;
  }

  return (
    <AIPanelContainer toggle={toggle}>
      <AIPanelTitle>Generate SQL query with AI</AIPanelTitle>
      <AIPanelForm
        status={rd.status}
        handleSubmit={handleSubmit}
        prompt={prompt}
        setPrompt={setPrompt}
        disableSubmitButton={maxQueryExecution}
      />
      <AIPanelSuggestion
        completionRd={rd}
        makeUseOfSuggestion={makeUseOfSuggestion}
      />
      {(maxQueryExecution || isQuotaLimitBeingReached) &&
        workspaceInfo.id &&
        quotaLimit && (
          <UpgradePlanWarning
            workspaceId={workspaceInfo.id}
            showQueryQuotaLimit={isQuotaLimitBeingReached}
            maxQueryExecution={maxQueryExecution}
            quotaLimit={quotaLimit}
          />
        )}
      {isQuotaLimitBeingReached && (
        <p css={queriesLeftStyles}>
          {nrQueriesLeft} of {quotaLimit} credits left
        </p>
      )}
    </AIPanelContainer>
  );
};

const queriesLeftStyles = css(p13Regular, {
  paddingLeft: '5px',
});
