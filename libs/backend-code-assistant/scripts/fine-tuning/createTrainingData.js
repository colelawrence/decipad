/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
const { existsSync } = require('node:fs');
const { readFile, writeFile } = require('node:fs/promises');
const { getOpenAI } = require('./openai');
const { join } = require('node:path');
const { mkdirp } = require('mkdirp');
const { docs } = require('./config/docs');
const { notebooks } = require('./config/notebooks');
const { conversationToChatMessages } = require('./conversationToChatMessages');
const verbalizeDocument = require('../../../doc-verbalizer/build').default;

const createTrainingDataFromDocs = async () => {
  for (const filePath of docs) {
    if (!existsSync(filePath)) {
      throw new Error(`Could not find file ${filePath}`);
    }
  }

  const prompts = [];

  for (const filePath of docs) {
    console.log(`- ${filePath}`);
    const expectedReply = await readFile(filePath, 'utf8');
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        {
          role: 'system',
          content: `Decipad a notebook that allows the user to insert calculations and low-code elements. You are a bot that replies with documentation about a certain feature of the Decipad language. The user is using the Decipad notebook and will give you a prompt. Give me the optimal ChatGPT prompt that will produce the following response when the user asks something about the Decipad. Reply with the user prompt only.`,
        },
        { role: 'user', content: expectedReply },
      ],
    });
    const { message } = completion.choices[0];
    prompts.push({
      messages: [
        {
          role: 'system',
          content:
            'Decipad a notebook that allows the user to insert calculations and low-code elements. You are a helpful chat bot that answers users questions about Decipad with documentation about a certain feature of the Decipad language.',
        },
        { role: 'user', content: message.content },
        { role: 'assistant', content: expectedReply },
      ],
    });
  }
  return prompts;
};

const createTrainingDataFromNotebooks = async () => {
  for (const filePath of notebooks) {
    if (!existsSync(filePath)) {
      throw new Error(`Could not find file ${filePath}`);
    }
  }

  const prompts = [];

  for (const filePath of notebooks) {
    console.log(`- ${filePath}`);
    const notebook = JSON.parse(await readFile(filePath, 'utf8'));
    const expectedReply = verbalizeDocument(notebook)
      .verbalized.map((v) => v.verbalized)
      .join('\n\n');
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        {
          role: 'system',
          content:
            'Decipad a notebook that allows the user to insert calculations and low-code elements. The user is using the Decipad notebook and will give you a prompt. Give me the optimal ChatGPT prompt that will produce the following response when the user asks to produce a Decipad document. Reply with the user prompt only.',
        },
        { role: 'user', content: expectedReply },
      ],
    });
    const { message } = completion.choices[0];
    prompts.push({
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful chat bot that helps users create a Decipad notebook. Decipad is a notebook product that allows users to insert calculations and low-code elements.',
        },
        { role: 'user', content: message.content },
        { role: 'assistant', content: expectedReply },
      ],
    });
  }
  return prompts;
};

const conversationFiles = [
  'conversations-pedro.json',
  'conversations-simao.json',
  'conversations-john.json',
];

const createTrainingDataFromConversations = async () => {
  console.log('Loading conversations...');
  let conversations = [];
  for (const file of conversationFiles) {
    const moreConversations = JSON.parse(
      await readFile(join(__dirname, 'config', 'conversations', file), 'utf8')
    );
    conversations = conversations.concat(moreConversations);
  }
  return conversations.map(conversationToChatMessages).map((messages) => ({
    messages,
  }));
};

const saveTrainingData = async (prompts) => {
  const dirPath = join(__dirname, 'build');
  const filePath = join(dirPath, 'training-data.jsonl');
  await mkdirp(dirPath);
  console.log('Writing training data to', filePath);
  const fileContents = prompts
    .map((prompt) => JSON.stringify(prompt))
    .join('\n');
  await writeFile(filePath, fileContents);
};

exports.createTrainingData = async () => {
  const prompts = (await createTrainingDataFromDocs())
    .concat(await createTrainingDataFromNotebooks())
    .concat(await createTrainingDataFromConversations());
  console.log('Saving training data...');
  await saveTrainingData(prompts);
  console.log('Saved');
};
