import { useState, FC } from 'react';
import {
  AIPanelSuggestion,
  AIPanelForm,
  AIPanelTitle,
  AIPanelContainer,
} from './components';
import { useRdFetch } from './hooks';

type ParagraphAIPanelProps = {
  paragraph: string;
  updateParagraph: (s: string) => void;
  toggle: () => void;
};

export const ParagraphAIPanel: FC<ParagraphAIPanelProps> = ({
  paragraph,
  updateParagraph,
  toggle,
}) => {
  const [prompt, setPrompt] = useState('');
  const [rd, fetch] = useRdFetch<'rewrite-paragraph'>(
    '/api/ai/rewrite-paragraph'
  );

  const handleSubmit = () => {
    fetch({ prompt, paragraph });
  };

  return (
    <AIPanelContainer toggle={toggle}>
      <AIPanelTitle>Rewrite paragraph with AI</AIPanelTitle>
      <AIPanelForm
        handleSubmit={handleSubmit}
        prompt={prompt}
        setPrompt={setPrompt}
        disabled={rd.status === 'loading'}
      />
      <AIPanelSuggestion
        completionRd={rd}
        useSuggestion={updateParagraph}
        regenerate={handleSubmit}
      />
    </AIPanelContainer>
  );
};
