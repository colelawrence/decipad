import { Meta, Story } from '@storybook/react';
import { Paragraph } from './Paragraph';

export default {
  title: 'Atoms / Paragraph',
  component: Paragraph,
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Paragraph {...args} />
);
Normal.args = { children: 'Text' };

export const Placeholder: Story<{ placeholder: string }> = (args) => (
  <Paragraph {...args}>{null}</Paragraph>
);
Placeholder.args = { placeholder: 'Text goes here' };
