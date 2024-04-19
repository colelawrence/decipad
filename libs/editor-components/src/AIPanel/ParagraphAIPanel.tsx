import { getAnalytics } from '@decipad/client-events';
import type { MyEditor } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { UpgradePlanWarning, p13Regular } from '@decipad/ui';
import { css } from '@emotion/react';
import { getNodeString } from '@udecode/plate-common';
import { blockSelectionStore } from '@udecode/plate-selection';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  AIPanelContainer,
  AIPanelForm,
  AIPanelSuggestion,
  AIPanelTitle,
} from './components';
import type {
  AiParaOp,
  PromptSuggestion,
} from './components/PromptSuggestions';
import { PromptSuggestions } from './components/PromptSuggestions';
import { useRdFetch } from './hooks';

const getTextFromSelectParagraphs = (
  editor: MyEditor,
  originalPara: string
) => {
  if (editor.selection != null) {
    return originalPara;
  }
  const allBlockIds = blockSelectionStore.get.selectedIds() as Set<string>;
  const matchingChildren = editor.children.filter((child) => {
    return allBlockIds.has(child.id);
  });
  const childText = matchingChildren
    .map((child) => getNodeString(child))
    .join('\n\n');
  return childText;
};

export type ParagraphAIPanelProps = {
  paragraph: string;
  updateParagraph: (s: string, op?: AiParaOp) => void;
  toggle: () => void;
};

export const ParagraphAIPanel: FC<ParagraphAIPanelProps> = ({
  paragraph,
  updateParagraph,
  toggle,
}) => {
  const [prompt, setPrompt] = useState<PromptSuggestion>(DefaultPrompt);
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

  const editor = useMyEditorRef();

  const handleSubmit = async () => {
    getAnalytics().then((analytics) =>
      analytics?.track('submit AI paragraph rewrite', { prompt })
    );
    const result = await updateQueryExecutionCount();
    const newExecutedQueryData = result.data?.incrementQueryCount;
    const errors = result.error?.graphQLErrors;
    const limitExceededError = errors?.find(
      (err) => err.extensions.code === 'LIMIT_EXCEEDED'
    );

    if (newExecutedQueryData) {
      fetch({
        prompt: prompt.prompt,
        paragraph: getTextFromSelectParagraphs(editor, paragraph),
      });
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
      <AIPanelTitle>Write with AI</AIPanelTitle>
      <PromptSuggestions
        prompts={promptSuggestions}
        disabled={rd.status === 'loading' || maxQueryExecution}
        runPrompt={(props) => {
          setPrompt(props);
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
        prompt={prompt}
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

      <p css={queriesLeftStyles} contentEditable={false}>
        {nrQueriesLeft && quotaLimit
          ? `${nrQueriesLeft} of ${quotaLimit} credits left`
          : ''}
      </p>
    </AIPanelContainer>
  );
};

const queriesLeftStyles = css(p13Regular, {
  marginTop: '10px',
  paddingLeft: '5px',
  cursor: 'default',
});

const upgradePlanWarningWrapper = css({
  marginTop: '10px',
});

const DefaultPrompt: PromptSuggestion = {
  name: 'Improve writting',
  prompt: 'improve the writing',
  primary: 'below',
};
const promptSuggestions: PromptSuggestion[] = [
  DefaultPrompt,
  {
    name: 'Fix mistakes',
    prompt: 'with any spelling or grammar mistakes fixed',
    primary: 'replace',
  },
  {
    name: 'Shorter',
    prompt: 'Make the text shorter',
    primary: 'replace',
  },
  {
    name: 'Longer',
    prompt: 'Make the text longer',
    primary: 'replace',
  },
  {
    name: 'Simplify',
    prompt: 'simplify the language',
    primary: 'replace',
  },
  {
    name: 'Summarize',
    prompt: 'summarize the text',
    primary: 'below',
  },
  {
    name: 'Explain',
    prompt: 'explain what is written',
    primary: 'below',
  },
  {
    name: 'Find action items',
    prompt: 'find all action items and make a list of who needs to do what',
    primary: 'below',
  },
];
