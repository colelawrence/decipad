import { useState, FC, useCallback, useEffect } from 'react';
import { CheckboxSelected, Edit } from 'libs/ui/src/icons';
import { getAnalytics } from '@decipad/client-events';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { UpgradePlanWarning } from '@decipad/ui';
import { WARNING_CREDITS_LEFT_PERCENTAGE } from '@decipad/editor-types';
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

  const { workspaceInfo, setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();
  const { quotaLimit, queryCount, id } = workspaceInfo;
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

  const updateQueryExecutionCount = useCallback(async () => {
    return updateQueryExecCount({
      id: id || '',
    });
  }, [id, updateQueryExecCount]);

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
      />
      <AIPanelSuggestion
        completionRd={rd}
        makeUseOfSuggestion={updateParagraph}
        regenerate={handleSubmit}
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
    </AIPanelContainer>
  );
};
