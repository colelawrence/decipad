import { useState, FC, useCallback } from 'react';
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
  const [rd, fetch] = useRdFetch<'generate-sql'>(`/api/ai/generate-sql/${id}`);
  const handleSubmit = useCallback(() => {
    fetch(prompt);
  }, [fetch, prompt]);
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
      />
      <AIPanelSuggestion
        completionRd={rd}
        makeUseOfSuggestion={makeUseOfSuggestion}
      />
    </AIPanelContainer>
  );
};
