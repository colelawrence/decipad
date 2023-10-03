import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import type { PadRecord } from '@decipad/backendtypes';
import tables from '../../tables/src';
import { searchStore } from './searchStore';
import { debug } from './debug';
import { createVectorEmbeddings } from './createVectorEmbedding';
import { indexNames } from './config';
import { thirdParty } from '@decipad/backend-config';
import { SearchHit } from './types';

const expandSearch = async (search: string): Promise<string> => {
  debug('searchTemplates: expandSearch "%s"', search);
  const chat = new ChatOpenAI({
    openAIApiKey: thirdParty().openai.apiKey,
    temperature: 0.2,
    modelName: 'gpt-3.5-turbo-16k',
  });

  const result = await chat.predictMessages([
    new SystemMessage(
      'You use your judgement to create a sensible set of paragraphs (maximum 10 short paragraphs) describing the model and calculations necessary to fulfill the user prompt.'
    ),
    new HumanMessage(search),
  ]);

  return result.content;
};

export const searchTemplates = async (
  prompt: string,
  { startIndex = 0, maxResults = 10, k = 2 } = {}
): Promise<PadRecord[]> => {
  debug('searchTemplates: with prompt "%s"', prompt);

  const searchTerms = await expandSearch(prompt);
  debug('searchTemplates: expanded prompt to "%s"', searchTerms);

  const vectorEmbeddings = await createVectorEmbeddings(searchTerms);

  const searchClient = await searchStore();
  const searchResults = await searchClient.search({
    index: indexNames.notebookTemplates,
    body: {
      from: startIndex,
      size: maxResults,
      query: {
        knn: {
          embeddings_vector: {
            vector: vectorEmbeddings,
            k,
          },
        },
      },
    },
  });

  debug('searchTemplates: search results "%j"', searchResults.body.hits);

  const notebookIds = searchResults.body.hits.hits.map(
    // eslint-disable-next-line no-underscore-dangle
    (hit: SearchHit) => hit._id
  );

  const data = await tables();
  return data.pads.batchGet(notebookIds);
};
