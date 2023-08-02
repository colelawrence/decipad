import { useState, FC, useCallback, useEffect } from 'react';
import { CheckboxSelected, Edit } from 'libs/ui/src/icons';
import { getAnalytics } from '@decipad/client-events';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { p13Regular, UpgradePlanWarning } from '@decipad/ui';
import { css } from '@emotion/react';
import {
  AIPanelSuggestion,
  AIPanelForm,
  AIPanelTitle,
  AIPanelContainer,
} from './components';
import { useRdFetch } from './hooks';
import {
  PromptSuggestion,
  PromptSuggestions,
} from './components/PromptSuggestions';

type ParagraphAIPanelProps = {
  paragraph: string;
  updateParagraph: (s: string) => void;
  toggle: () => void;
};

const promptSuggestions: PromptSuggestion[] = [
  { icon: <Edit />, name: 'Simplify', prompt: 'to be simpler' },
  {
    icon: <CheckboxSelected />,
    name: 'Fix any mistakes',
    prompt: 'with any mistakes fixed',
  },
];

export const ParagraphAIPanel: FC<ParagraphAIPanelProps> = ({
  paragraph,
  updateParagraph,
  toggle,
}) => {
  const [prompt, setPrompt] = useState('');
  const [rd, fetch] = useRdFetch('rewrite-paragraph');

  const {
    workspaceInfo,
    setCurrentWorkspaceInfo,
    nrQueriesLeft,
    isQuotaLimitBeingReached,
  } = useCurrentWorkspaceStore();
  const { quotaLimit, queryCount, id } = workspaceInfo;
  const [, updateQueryExecCount] = useIncrementQueryCountMutation();
  const [maxQueryExecution, setMaxQueryExecution] = useState(false);

  const updateQueryExecutionCount = useCallback(async () => {
    return updateQueryExecCount({
      id: id || '',
    });
  }, [id, updateQueryExecCount]);

  useEffect(() => {
    if (queryCount && quotaLimit) {
      setMaxQueryExecution(quotaLimit <= queryCount);
    }
  }, [quotaLimit, queryCount, nrQueriesLeft]);

  const handleSubmit = async () => {
    const analytics = getAnalytics();
    if (analytics) {
      analytics.track('submit AI paragraph rewrite', { prompt });
    }
    const result = await updateQueryExecutionCount();
    const newExecutedQueryData = result.data?.incrementQueryCount;
    const errors = result.error?.graphQLErrors;
    const limitExceededError = errors?.find(
      (err) => err.extensions.code === 'LIMIT_EXCEEDED'
    );

    if (newExecutedQueryData) {
      fetch({ prompt, paragraph });
      setCurrentWorkspaceInfo({
        ...workspaceInfo,
        queryCount: newExecutedQueryData.queryCount,
        quotaLimit: newExecutedQueryData.quotaLimit,
      });
    } else if (limitExceededError) {
      setMaxQueryExecution(true);
    }
  };

  return (
    <AIPanelContainer toggle={toggle}>
      <AIPanelTitle>Rewrite paragraph with AI</AIPanelTitle>
      <PromptSuggestions
        prompts={promptSuggestions}
        disabled={rd.status === 'loading' || maxQueryExecution}
        runPrompt={(prmpt) => {
          setPrompt(prmpt);
          handleSubmit();
        }}
      />
      <AIPanelForm
        handleSubmit={handleSubmit}
        prompt={prompt}
        setPrompt={setPrompt}
        status={rd.status}
        disableSubmitButton={maxQueryExecution}
      />
      <AIPanelSuggestion
        completionRd={rd}
        makeUseOfSuggestion={updateParagraph}
        regenerate={handleSubmit}
      />
      {(isQuotaLimitBeingReached || maxQueryExecution) &&
        workspaceInfo.id &&
        quotaLimit && (
          <div css={upgradePlanWarningWrapper}>
            <UpgradePlanWarning
              workspaceId={workspaceInfo.id}
              showQueryQuotaLimit={isQuotaLimitBeingReached}
              maxQueryExecution={maxQueryExecution}
              quotaLimit={quotaLimit}
            />
          </div>
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
  marginTop: '10px',
  paddingLeft: '5px',
});

const upgradePlanWarningWrapper = css({
  marginTop: '10px',
});
