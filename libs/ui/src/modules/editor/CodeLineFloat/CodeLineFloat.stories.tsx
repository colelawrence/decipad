import { Meta, StoryFn } from '@storybook/react';
import { CodeLineFloat } from './CodeLineFloat';

const args = {
  offsetTop: 50,
};

export default {
  title: 'Atoms / Editor / CodeLine / Float',
  component: CodeLineFloat,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = () => <CodeLineFloat {...args} />;
