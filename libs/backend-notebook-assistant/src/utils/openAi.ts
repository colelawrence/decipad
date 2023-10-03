import OpenAI from 'openai';
import { once } from 'ramda';
import { thirdParty } from '@decipad/backend-config';

export const getOpenAI = once(() => {
  const { apiKey } = thirdParty().openai;
  return new OpenAI({ apiKey });
});
