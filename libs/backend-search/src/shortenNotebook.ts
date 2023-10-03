import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { thirdParty } from '../../backend-config/src';
import { debug } from './debug';

export const shortenNotebook = async (content: string): Promise<string> => {
  debug('shortenNotebook', content);
  const chat = new ChatOpenAI({
    openAIApiKey: thirdParty().openai.apiKey,
    temperature: 0.2,
    modelName: 'gpt-3.5-turbo-16k',
  });
  const result = await chat.predictMessages([
    new SystemMessage(
      'You use your judgement to create a shortened version of the document given by the user, explaining all the steps taken.'
    ),
    new HumanMessage(content),
  ]);

  debug('shortenNotebook: result', result.content);

  return result.content;
};
