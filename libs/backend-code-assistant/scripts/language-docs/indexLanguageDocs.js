/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const { searchStore } = require('../../config/searchStore');
const { readFile } = require('node:fs/promises');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { languageDocs, languageDocPath } = require('../../config/languageDocs');
const { indexNames } = require('../../config/indexNames');
const { createVectorEmbedding } = require('./createVectorEmbedding');
const { cleanMarkdown } = require('../utils/cleanMarkdown');

const splitterChunkSize = 1000;
const splitterChunkOverlap = 100;

const getExistingSnippetIds = async (store) => {
  const result = await store.search({
    index: indexNames.languageDocsVector,
    _source: ['_id'],
  });
  return new Set(result.body.hits.hits.map((hit) => hit._id));
};

const insertNewLanguageDocsSnippets = async (store) => {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize: splitterChunkSize,
    chunkOverlap: splitterChunkOverlap,
  });

  const insertedIds = [];
  for (const doc of languageDocs) {
    console.log(`-------------> ${doc}`);
    const docContent = await cleanMarkdown(
      await readFile(languageDocPath(doc), {
        encoding: 'utf-8',
      })
    );
    console.log('doc content:', docContent);
    const chunks = await splitter.createDocuments([docContent]);
    let chunkIndex = -1;
    for (const chunk of chunks) {
      console.log(`chunk:\n${chunk.pageContent}`);
      chunkIndex += 1;
      const vector = await createVectorEmbedding(chunk.pageContent);
      const id = `${doc}/chunks/${chunkIndex}`;
      await store.index({
        id,
        index: indexNames.languageDocsVector,
        body: { chunk: chunk.pageContent, embeddings_vector: vector },
      });
      insertedIds.push(id);
    }
  }
  return new Set(insertedIds);
};

const removeOldSnippetIds = async (store, oldIds, newIds) => {
  for (const oldId of oldIds) {
    if (!newIds.has(oldId)) {
      console.log(`removing doc ${oldId}`);
      await store.delete({
        id: oldId,
        index: indexNames.languageDocsVector,
      });
    }
  }
};

const indexLanguageDocs = async (_store) => {
  const store = _store ?? (await searchStore());
  const existingIds = await getExistingSnippetIds(store);
  const insertedIds = await insertNewLanguageDocsSnippets(store);
  await removeOldSnippetIds(store, existingIds, insertedIds);
};
exports.indexLanguageDocs = indexLanguageDocs;
