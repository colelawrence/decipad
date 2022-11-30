import { Meta, Story } from '@storybook/react';
import { CodeLinePlaceholder } from './CodeLinePlaceholder';

const args = {
  height: 50,
};

export default {
  title: 'Atoms / Editor / CodeLine / Placeholder',
  component: CodeLinePlaceholder,
  args,
} as Meta;

export const Normal: Story<typeof args> = () => (
  <CodeLinePlaceholder {...args} />
);
