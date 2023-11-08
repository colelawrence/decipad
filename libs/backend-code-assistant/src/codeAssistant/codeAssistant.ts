/* eslint-disable no-await-in-loop */
import { RootDocument } from '@decipad/editor-types';
import { ChatCompletionMessage } from 'openai/resources/chat';
import { getDefined } from '@decipad/utils';
import { getOpenAI } from '../utils/openAi';
import { debug } from '../debug';
import { getCode } from '../utils/getCode';
import { splitCode } from '../utils/splitCode';
import { generateInitialMessages } from './generateInitialMessages';
import { SplitCodeResult } from '../types';

const fineTunedModelForDecilangCode =
  'ft:gpt-3.5-turbo-0613:team-n1n-co::86fVKLap';

export interface CodeAssistantOptions {
  summary?: string;
  notebook?: RootDocument;
  prompt: string;
  _messages?: ChatCompletionMessage[];
  attempt?: number;
  previousAttemptResult?: SplitCodeResult | undefined;
}

const maxAttempts = 4;

export const codeAssistant = async (
  props: CodeAssistantOptions
): Promise<SplitCodeResult | undefined> => {
  debug('codeAssistant', JSON.stringify(props, null, '\t'));
  let code = props.previousAttemptResult;
  const { summary, notebook, prompt, _messages, attempt = 1 } = props;
  if (attempt === maxAttempts) {
    return code;
  }
  const messages =
    _messages ??
    (await generateInitialMessages({
      summary,
      notebook: getDefined(notebook),
      prompt,
    }));
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
    let willTryEscaping = false;
    while (!willTryEscaping) {
      try {
        const codeString = getCode(content, willTryEscaping);
        debug(`getCode returned ${codeString}`);
        if (codeString && props.notebook) {
          code = splitCode(codeString);
          debug('split code successfully');
          // const validation = await validateCode(codeString, props.notebook);
          // if (!validation.valid) {
          //   debug('throwing validation error', validation.error);
          //   throw new Error(validation.error);
          // }
          return code;
        }
      } catch (err) {
        debug('Error caught in validation', err);
        if (!willTryEscaping) {
          willTryEscaping = true;
          continue;
        }
        messages.push(assistantMessage);
        messages.push({
          role: 'user',
          content: `${(err as Error).message}\nPlease fix this.`,
        });
        debug('going to try again');
        return codeAssistant({
          ...props,
          _messages: messages,
          attempt: attempt + 1,
          previousAttemptResult: code,
        });
      }
    }
  }
  return code;
};
