import { getAnalytics } from '@decipad/client-events';
import {
  useResourceUsage,
  useCurrentWorkspaceStore,
} from '@decipad/react-contexts';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import {
  AIPanelContainer,
  AIPanelForm,
  AIPanelSuggestion,
  AIPanelTitle,
} from './components';
import type { PromptSuggestion } from './components/PromptSuggestions';
import { useRdFetch } from './hooks';
import { UpgradeWarningBlock } from '../Integrations';

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
  const { workspaceInfo } = useCurrentWorkspaceStore();

  const { ai } = useResourceUsage();

  const handleSubmit = useCallback(async () => {
    const promptText = prompt.prompt;
    getAnalytics().then((analytics) => {
      analytics?.track('submit AI live query', { promptText });
    });

    fetch({
      externalDataSourceId: id,
      prompt: promptText,
      workspaceId: workspaceInfo.id ?? '',
    });

    if (rd.status === 'success' && rd.result.usage) {
      ai.updateUsage({ usage: rd.result.usage });
    }
  }, [prompt.prompt, fetch, id, workspaceInfo.id, rd, ai]);

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
        disableSubmitButton={ai.hasReachedLimit}
      />
      <AIPanelSuggestion
        completionRd={rd}
        makeUseOfSuggestion={makeUseOfSuggestion}
        prompt={prompt}
      />
      <UpgradeWarningBlock
        type="ai"
        variant="block"
        workspaceId={workspaceInfo.id ?? ''}
      />
    </AIPanelContainer>
  );
};
