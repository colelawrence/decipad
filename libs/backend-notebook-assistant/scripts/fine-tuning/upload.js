/* eslint-disable no-underscore-dangle */
const { createReadStream } = require('node:fs');
const { join } = require('node:path');
const { getOpenAI } = require('./openai.js');

exports.uploadFineTuneFile = async () => {
  return getOpenAI().files.create({
    file: createReadStream(join(__dirname, 'build', 'training-data.jsonl')),
    purpose: 'fine-tune',
  });
};
