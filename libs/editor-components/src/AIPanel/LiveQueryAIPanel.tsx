import { useState, FC } from 'react';
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
  if (!id) {
    return null;
  }
  const handleSubmit = () => {
    fetch(prompt);
  };

  return (
    <AIPanelContainer toggle={toggle}>
      <AIPanelTitle>Generate SQL query with AI</AIPanelTitle>
      <AIPanelForm
        handleSubmit={handleSubmit}
        prompt={prompt}
        setPrompt={setPrompt}
        disabled={rd.status === 'loading'}
      />
      <AIPanelSuggestion
        completionRd={rd}
        useSuggestion={(s) => {
          toggle();
          updateQueryText(s);
        }}
      />
    </AIPanelContainer>
  );
};
