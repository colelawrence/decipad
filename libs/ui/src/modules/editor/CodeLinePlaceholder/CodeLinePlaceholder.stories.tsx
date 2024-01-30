import { Meta, StoryFn } from '@storybook/react';
import { CodeLinePlaceholder } from './CodeLinePlaceholder';

const args = {
  height: 50,
};

export default {
  title: 'Atoms / Editor / CodeLine / Placeholder',
  component: CodeLinePlaceholder,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = () => (
  <CodeLinePlaceholder {...args} />
);
