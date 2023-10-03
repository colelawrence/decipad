import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { thirdParty } from '../../backend-config/src';
import { shortenNotebook } from './shortenNotebook';
import { EmbeddingsVector } from './types';
import { getDefined } from '@decipad/utils';

interface ErrorWithType extends Error {
  type: string;
}

const maxShorteningAttempts = 3;

export const createVectorEmbeddings = async (
  content: string,
  previousAttempts = 0
): Promise<EmbeddingsVector> => {
  const shortenedContent = await shortenNotebook(content);
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: thirdParty().openai.apiKey,
    modelName: 'text-embedding-ada-002',
  });

  let vector;
  try {
    vector = await embeddings.embedDocuments([shortenedContent]);
  } catch (err) {
    if (
      (err as ErrorWithType).type.includes('invalid_request_error') &&
      maxShorteningAttempts > previousAttempts
    ) {
      return createVectorEmbeddings(shortenedContent, previousAttempts + 1);
    }
    throw err;
  }
  return getDefined(vector[0]);
};
