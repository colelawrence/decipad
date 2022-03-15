import { Meta, Story } from '@storybook/react';
import { MenuSeparator } from './MenuSeparator';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / Menu Separator',
  component: MenuSeparator,
} as Meta<Args>;

export const Normal: Story = () => <MenuSeparator />;
