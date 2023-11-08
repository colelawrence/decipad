import { type RootDocument } from '@decipad/editor-types';
import type { ChatCompletionMessage } from 'openai/resources/chat';
import { createComputationalSummary } from '../utils/createComputationalSummary';
import { debug } from '../debug';
import { getLanguageDocSnippets } from '../utils/getLanguageDocSnippets';
import { instructions, intro } from './texts';

const maxLanguageDocSnippetCount = 2;

interface GenerateInitialMessagesOptions {
  notebook: RootDocument;
  summary?: string;
  prompt: string;
}

export const generateInitialMessages = async ({
  summary: _summary,
  notebook,
  prompt,
}: GenerateInitialMessagesOptions): Promise<ChatCompletionMessage[]> => {
  const summary =
    _summary != null ? _summary : createComputationalSummary(notebook);

  debug('summary:', summary);

  const summaryText =
    summary &&
    `This is a summary of the code elements in the notebook you can use:

  SUMMARY:"""
  ${summary}
  """`;

  const snippets = await getLanguageDocSnippets(
    `${summary}
${prompt}`,
    maxLanguageDocSnippetCount
  );

  const snippetsText =
    snippets.length > 0
      ? `Relevant Decipad language doc snippets:

${snippets.map((snippet) => `Docs:"""\n${snippet}\n"""\n`).join('\n')}
`
      : '';

  debug('language docs snippets:', snippetsText);

  return [
    {
      role: 'system',
      content: `${intro}

${snippetsText}

${summaryText}

${instructions}`,
    },
    {
      role: 'user',
      content: `I want a Decipad language code snippet for my notebook that will allow me to ${prompt}.

No comments.`,
    },
  ];
};
