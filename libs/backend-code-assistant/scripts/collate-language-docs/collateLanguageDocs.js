#!/usr/bin/env node
/* eslint-disable no-console */

const { readFile } = require('fs/promises');
const { languageDocs, languageDocPath } = require('../../config/languageDocs');
const { cleanMarkdown } = require('../utils/cleanMarkdown');

const collateLanguageDocs = async () => {
  const docs = await Promise.all(
    languageDocs.map(async (doc) => {
      return cleanMarkdown(
        await readFile(languageDocPath(doc), {
          encoding: 'utf-8',
        })
      );
    })
  );
  return docs.join('\n\n');
};

(async () => {
  console.log(await collateLanguageDocs());
})();
