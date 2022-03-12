import { Meta, Story } from '@storybook/react';
import { padding } from '../../storybook-utils';
import { MenuSeparator } from './MenuSeparator';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / Menu Separator',
  component: MenuSeparator,
  decorators: [padding(12)],
} as Meta<Args>;

export const Normal: Story = () => <MenuSeparator />;
