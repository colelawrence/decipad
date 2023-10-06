import OpenAI from 'openai';
import { once } from 'ramda';
import { thirdParty } from '@decipad/backend-config';

export const getOpenAI = once(() => {
  const { apiKey } = thirdParty().openai;
  return {
    client: new OpenAI({ apiKey }),
    model: 'gpt-3.5-turbo-16k',
    maxTokens: 16385,
  };
});
