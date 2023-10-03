const { getOpenAI } = require('./openai');

exports.createFinetuningJob = async (fileId) => {
  return getOpenAI().fineTuning.jobs.create({
    training_file: fileId,
    model: 'gpt-3.5-turbo',
  });
};
