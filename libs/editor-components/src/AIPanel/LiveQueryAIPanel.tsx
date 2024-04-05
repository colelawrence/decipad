import { getAnalytics } from '@decipad/client-events';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { UpgradePlanWarning, p13Regular } from '@decipad/ui';
import { css } from '@emotion/react';
import { FC, useCallback, useEffect, useState } from 'react';
import {
  AIPanelContainer,
  AIPanelForm,
  AIPanelSuggestion,
  AIPanelTitle,
} from './components';
import { PromptSuggestion } from './components/PromptSuggestions';
import { useRdFetch } from './hooks';

type LiveQueryAIPanelProps = {
  id: string;
  updateQueryText: (s: string) => void;
  toggle: () => void;
};

//
// todo: this file is not in use
//
// if it was to be in use we would need to alter  AIPanelSuggestion and AIPanelForm
// as the buttons cater to paragraph rewriting
//
const makePrompt = (myText: string): PromptSuggestion => {
  return {
    name: 'SQL',
    prompt: myText,
    primary: 'replace',
  };
};

export const LiveQueryAIPanel: FC<LiveQueryAIPanelProps> = ({
  id,
  updateQueryText,
  toggle,
}) => {
  const [prompt, setPrompt] = useState(makePrompt('SELECT * FROM fishes'));
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
    const promptText = prompt.prompt;
    getAnalytics().then(({ track }) => {
      track('submit AI live query', { promptText });
    });
    const result = await updateQueryExecutionCount();
    const newExecutedQueryData = result.data?.incrementQueryCount;
    const errors = result.error?.graphQLErrors;
    const limitExceededError = errors?.find(
      (err) => err.extensions.code === 'LIMIT_EXCEEDED'
    );

    if (newExecutedQueryData) {
      fetch({ externalDataSourceId: id, prompt: promptText });
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
        prompt={prompt}
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
