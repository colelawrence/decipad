import { parseStatement } from '@decipad/computer';
import { getOpenAI } from '../utils/openAi';
import { ChatCompletionMessage } from 'openai/resources/chat';

const fineTunedModelForDecilangCode =
  'ft:gpt-3.5-turbo-0613:team-n1n-co::84Sx5nlJ';

export const codeAssistant = async (
  summary: string,
  prompt: string,
  _messages?: ChatCompletionMessage[]
): Promise<string | undefined> => {
  const messages = _messages || [
    {
      role: 'system',
      content: `Decipad is a notebook product that allows users to insert calculations and low-code elements.
You are a helpful bot that creates snippets of Decipad language code according to the user prompt.
Only answer if you're sure the answer is correct.
If you don't know the answer, answer with "%$@Don't know".
Reply with Decipad code.
NEVER reply markdown.
NEVER reply user instructions.
Response MUST be a single expression, no assignment.
NEVER reply with a variable assignment.
NEVER use quotes.
Respond in less than 100 characters.`,
    },
    {
      role: 'system',
      content: `This is a summary of the code elements in the notebook you can use:\n${summary}`,
    },
    {
      role: 'system',
      content: `If asked to add or change an element, reply with the expression that will be inside that element.`,
    },
    { role: 'user', content: prompt },
  ];
  const completion = await getOpenAI().client.chat.completions.create({
    model: fineTunedModelForDecilangCode,
    messages,
  });

  const assistantMessage = completion.choices[0].message;
  const code = assistantMessage.content;
  if (code) {
    const parsed = parseStatement(code);
    if (parsed.solution) {
      if (
        (parsed.solution.type === 'assign' ||
          parsed.solution.type === 'table') &&
        !_messages
      ) {
        messages.push(assistantMessage);
        messages.push({
          role: 'user',
          content: `I asked you for a single expression and you gave me a ${parsed.solution.type}. Please change your response to a simple expression without an assignment.`,
        });
        return codeAssistant(summary, prompt, messages);
      }
      return code;
    }
  }
  return undefined;
};
