/* eslint-disable no-underscore-dangle */
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { PadRecord } from '@decipad/backendtypes';
import tables from '../../tables/src';
import { searchStore } from './searchStore';
import { debug } from './debug';
import { createVectorEmbeddings } from './createVectorEmbedding';
import { indexNames } from './config';
import { thirdParty } from '@decipad/backend-config';
import type { SearchHit } from './types';
import { messageContentToString } from './utils/messageContentToString';

export interface TemplateSearchResult {
  notebook: PadRecord;
  summary?: string;
}

export type TemplateSearchResults = Array<TemplateSearchResult>;

const expandSearch = async (search: string): Promise<string> => {
  debug('searchTemplates: expandSearch "%s"', search);
  const chat = new ChatOpenAI({
    openAIApiKey: thirdParty().openai.apiKey,
    temperature: 0.2,
    modelName: 'gpt-3.5-turbo-16k',
  });

  const result = await chat.invoke([
    new SystemMessage(
      'You use your judgement to create a sensible set of paragraphs (maximum 2 short paragraphs) describing the model and calculations necessary to fulfill the user prompt.'
    ),
    new HumanMessage(search),
  ]);

  return messageContentToString(result.content);
};

const semanticSearchTemplates = async (
  prompt: string,
  { startIndex = 0, maxResults = 10, k = 2 } = {}
): Promise<TemplateSearchResults> => {
  debug('semanticSearchTemplates: with prompt "%s"', prompt);

  const searchTerms = await expandSearch(prompt);
  debug('semanticSearchTemplates: expanded prompt to "%s"', searchTerms);

  const [vectorEmbeddings] = await createVectorEmbeddings(searchTerms);

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

  debug(
    'semanticSearchTemplates: search results "%j"',
    searchResults.body.hits
  );

  const hits = searchResults.body.hits.hits as Array<SearchHit>;
  const notebookIds = hits.map((r: SearchHit) => r._id);
  const notebookById = Object.fromEntries(hits.map((hit) => [hit._id, hit]));

  const data = await tables();
  const notebooks = await data.pads.batchGet(notebookIds);
  return notebooks.map((n) => ({
    notebook: n,
    summary: notebookById[n.id]._source.summary,
  }));
};

const textOnlySearchTemplates = async (
  prompt: string,
  { startIndex = 0, maxResults = 10 } = {}
): Promise<TemplateSearchResults> => {
  debug('textOnlySearchTemplates: with prompt "%s"', prompt);

  const searchClient = await searchStore();
  const searchResults = await searchClient.search({
    index: indexNames.notebookTemplates,
    body: {
      from: startIndex,
      size: maxResults,
      query: {
        multi_match: {
          query: prompt,
          fields: ['title', 'summary', 'body'],
        },
      },
    },
  });

  debug(
    'textOnlySearchTemplates: search results "%j"',
    searchResults.body.hits
  );

  const hits = searchResults.body.hits.hits as Array<SearchHit>;
  const notebookIds = hits.map((r: SearchHit) => r._id);
  const notebookById = Object.fromEntries(hits.map((hit) => [hit._id, hit]));

  const data = await tables();
  const notebooks = await data.pads.batchGet(notebookIds);
  return notebooks.map((n) => ({
    notebook: n,
    summary: notebookById[n.id]._source.summary,
  }));
};

export const searchTemplates = async (
  prompt: string,
  { faster = false, startIndex = 0, maxResults = 10, k = 2 } = {}
): Promise<TemplateSearchResults> => {
  if (faster) {
    return textOnlySearchTemplates(prompt, {
      startIndex,
      maxResults,
    });
  }
  return semanticSearchTemplates(prompt, {
    startIndex,
    maxResults,
    k,
  });
};
