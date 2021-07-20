import { LoremIpsum } from 'lorem-ipsum';
import React from 'react';
import { Blockquote } from './Blockquote.component';

export default {
  title: 'Editor/Blocks/Blockquote',
  component: Blockquote,
};

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

export const Default = (args: { text: string }) => (
  <Blockquote
    leaf={{ attributes: {}, text: '' }}
    element={{ children: [{ text: '' }] }}
    text={{ text: '' }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
      'data-slate-leaf': true,
    }}
  >
    {args.text}
  </Blockquote>
);

Default.args = {
  text: lorem.generateParagraphs(5),
};

Default.storyName = 'Blockquote';
