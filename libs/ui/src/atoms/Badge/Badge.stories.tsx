import { Meta, Story } from '@storybook/react';
import { Badge } from './Badge';

const args = {
  children: 'Decipad',
};
export default {
  title: 'Atoms / UI / Badge',
  component: Badge,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <Badge {...props} />;
