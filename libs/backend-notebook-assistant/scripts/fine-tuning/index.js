#!/usr/bin/env node
/* eslint-disable no-console */
const { createTrainingData } = require('./createTrainingData');
const { createFinetuningJob } = require('./job');
const { uploadFineTuneFile } = require('./upload');

const ALL_COMMANDS = 'create upload job';

(async () => {
  const argsString = process.argv.slice(2).join(' ') || ALL_COMMANDS;
  const args = argsString
    .split(' ')
    .map((s) => s.trim())
    .map((s) => s.toLowerCase());
  let fileId;

  console.log('args:', JSON.stringify(args.join(' ')));

  const executeCommand = async () => {
    const command = args.shift();
    if (!command) {
      return;
    }
    switch (command) {
      case 'create': {
        console.log('=> Creating training data...');
        await createTrainingData();
        break;
      }
      case 'upload': {
        console.log('=> Uploading training data...');
        fileId = (await uploadFineTuneFile()).id;
        console.log('uploaded file with id ', fileId);
        break;
      }

      case 'job': {
        console.log('=> Going to create finetuning job from file id ', fileId);
        if (!fileId) {
          fileId = args.shift();
        }
        if (!fileId) {
          throw new Error('need file id to start job');
        }
        const { id: jobId } = await createFinetuningJob(fileId);
        console.log('created job with id ', jobId);
        break;
      }
      default: {
        throw new Error(`Unknown command ${command}`);
      }
    }
  };

  while (args.length) {
    // eslint-disable-next-line no-await-in-loop
    await executeCommand();
  }
  console.log('Done.');
})();
