import { RootDocument } from '@decipad/editor-types';
import { getOpenAI } from '../utils/openAi';
import { ChatCompletionMessage } from 'openai/resources/chat';
import { getDefined } from '@decipad/utils';
import { createComputationalSummary } from '../utils/createComputationalSummary';
import { debug } from '../debug';
import { getCode } from '../utils/getCode';
import { getLanguageDocSnippets } from '../utils/getLanguageDocSnippets';
import { instructions, intro } from './texts';

const fineTunedModelForDecilangCode =
  'ft:gpt-3.5-turbo-0613:team-n1n-co::86fVKLap';

export interface CodeAssistantOptions {
  summary?: string;
  notebook?: RootDocument;
  prompt: string;
  _messages?: ChatCompletionMessage[];
  attempt?: number;
}

const maxLanguageDocSnippetCount = 2;
const maxAttempts = 4;

export const codeAssistant = async (
  props: CodeAssistantOptions
): Promise<string | undefined> => {
  debug('codeAssistant', JSON.stringify(props, null, '\t'));
  const { summary: _summary, notebook, prompt, _messages, attempt = 1 } = props;
  if (attempt === maxAttempts) {
    return undefined;
  }
  const summary =
    _summary != null
      ? _summary
      : createComputationalSummary(
          getDefined(notebook, 'need a notebook to generate a summary')
        );

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

  const messages = _messages || [
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
  debug('messages:', JSON.stringify(messages, null, '\t'));
  const completion = await getOpenAI().chat.completions.create({
    model: fineTunedModelForDecilangCode,
    messages,
    temperature: 0,
  });

  const assistantMessage = completion.choices[0].message;
  const { content } = assistantMessage;
  debug('reply:', content);
  if (content) {
    try {
      const code = getCode(content);
      debug('final reply:', code);
      return code;
    } catch (err) {
      messages.push(assistantMessage);
      messages.push({
        role: 'user',
        content: `${(err as Error).message}\nPlease fix this.`,
      });
      return codeAssistant({
        ...props,
        _messages: messages,
        attempt: attempt + 1,
      });
    }
  }
  return undefined;
};
