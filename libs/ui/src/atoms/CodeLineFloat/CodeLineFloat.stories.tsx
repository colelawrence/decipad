import { Meta, Story } from '@storybook/react';
import { CodeLineFloat } from './CodeLineFloat';

const args = {
  offsetTop: 50,
};

export default {
  title: 'Atoms / Editor / CodeLine / Float',
  component: CodeLineFloat,
  args,
} as Meta;

export const Normal: Story<typeof args> = () => <CodeLineFloat {...args} />;
