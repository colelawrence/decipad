import { useState, FC, useCallback, useEffect } from 'react';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { getAnalytics } from '@decipad/client-events';
import { WARNING_CREDITS_LEFT_PERCENTAGE } from '@decipad/editor-types';
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

  const { workspaceInfo, setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();
  const { quotaLimit, queryCount } = workspaceInfo;
  const [, updateQueryExecCount] = useIncrementQueryCountMutation();
  const [maxQueryExecution, setMaxQueryExecution] = useState(
    !!quotaLimit && !!queryCount && quotaLimit <= queryCount
  );
  const [nrQueriesLeft, setNrQueriesLeft] = useState(
    quotaLimit && queryCount ? quotaLimit - queryCount : null
  );
  const [showQueryQuotaLimit, setShowQueryQuotaLimit] = useState(
    !!nrQueriesLeft &&
      !!quotaLimit &&
      nrQueriesLeft > 0 &&
      nrQueriesLeft <= quotaLimit * WARNING_CREDITS_LEFT_PERCENTAGE
  );

  useEffect(() => {
    if (queryCount && quotaLimit) {
      setNrQueriesLeft(quotaLimit - queryCount);
      setShowQueryQuotaLimit(
        !!nrQueriesLeft &&
          nrQueriesLeft <= quotaLimit * WARNING_CREDITS_LEFT_PERCENTAGE &&
          nrQueriesLeft > 0
      );
      setMaxQueryExecution(quotaLimit <= queryCount);
    }
  }, [quotaLimit, queryCount, nrQueriesLeft]);

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
      {(showQueryQuotaLimit || maxQueryExecution) &&
        workspaceInfo.id &&
        quotaLimit && (
          <UpgradePlanWarning
            workspaceId={workspaceInfo.id}
            showQueryQuotaLimit={showQueryQuotaLimit}
            maxQueryExecution={maxQueryExecution}
            quotaLimit={quotaLimit}
          />
        )}
      {showQueryQuotaLimit && (
        <p css={queriesLeftStyles}>
          {nrQueriesLeft} of {quotaLimit} credits left
        </p>
      )}
    </AIPanelContainer>
  );
};

const queriesLeftStyles = css({
  ...p13Regular,
  paddingLeft: '5px',
});
