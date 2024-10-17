import { Meta, StoryFn } from '@storybook/react';
import { Paragraph, ParagraphProps } from './Paragraph';

const lorem =
  'Data Programming tools are powerful, but the barrier to entry is high. They require knowledge of complex programming languages like python. It is estimated that only ~0.5% of the world’s population knows how to code. And, inclusivity in data science continues to be a challenge.';

export default {
  title: 'Atoms / Editor / Text / Block / Paragraph',
  component: Paragraph,
} as Meta;

export const Normal: StoryFn<{ children: string }> = (args: ParagraphProps) => (
  <Paragraph {...args} />
);
Normal.args = { children: lorem };

export const Active: StoryFn<{ children: string }> = (args: ParagraphProps) => (
  <Paragraph {...args} />
);
Active.args = { children: lorem };

export const Placeholder: StoryFn<{ placeholder: string }> = (
  args: ParagraphProps
) => <Paragraph {...args}>{null}</Paragraph>;
Placeholder.args = { placeholder: 'Press "/" for options' };
