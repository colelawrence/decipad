import { useState, FC } from 'react';
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
import { CheckboxSelected, Edit } from 'libs/ui/src/icons';
import { getAnalytics } from '@decipad/client-events';

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
  const [rd, fetch] = useRdFetch<'rewrite-paragraph'>(
    '/api/ai/rewrite-paragraph'
  );

  const handleSubmit = () => {
    const analytics = getAnalytics();
    if (analytics) {
      analytics.track('submit AI paragraph rewrite', { prompt });
    }
    fetch({ prompt, paragraph });
  };

  return (
    <AIPanelContainer toggle={toggle}>
      <AIPanelTitle>Rewrite paragraph with AI</AIPanelTitle>
      <PromptSuggestions
        prompts={promptSuggestions}
        disabled={rd.status === 'loading'}
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
    </AIPanelContainer>
  );
};
