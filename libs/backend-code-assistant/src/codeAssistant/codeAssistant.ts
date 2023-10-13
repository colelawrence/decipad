import { RootDocument } from '@decipad/editor-types';
import { getOpenAI } from '../utils/openAi';
import { ChatCompletionMessage } from 'openai/resources/chat';
import { getDefined } from '@decipad/utils';
import { createComputationalSummary } from '../utils/createComputationalSummary';
import { debug } from '../debug';
import { getCode } from '../utils/getCode';
import { intro } from './texts';

const fineTunedModelForDecilangCode =
  'ft:gpt-3.5-turbo-0613:team-n1n-co::86fVKLap';

export interface CodeAssistantOptions {
  summary?: string;
  notebook?: RootDocument;
  prompt: string;
  _messages?: ChatCompletionMessage[];
  attempt?: number;
}

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

  const messages = _messages || [
    {
      role: 'system',
      content: `${intro}

${summaryText}

INSTRUCTIONS:"""
Use existing available variables in the code elements given above.
Variable names cannot have spaces in them.
Always reply with only one line of code wrapped in \`\`\`deci
<code here>
\`\`\`
No comments
"""`,
    },
    {
      role: 'user',
      content: `Get me a Decipad code line to ${prompt}

Just the code, no comments.`,
    },
  ];
  debug('messages:', JSON.stringify(messages, null, '\t'));
  const completion = await getOpenAI().chat.completions.create({
    model: fineTunedModelForDecilangCode,
    messages,
  });

  const assistantMessage = completion.choices[0].message;
  const { content } = assistantMessage;
  debug('reply:', content);
  if (content) {
    try {
      return getCode(content);
    } catch (err) {
      messages.push(assistantMessage);
      messages.push({
        role: 'user',
        content: (err as Error).message,
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
