import { Meta, StoryFn } from '@storybook/react';
import { Badge } from './Badge';

const args = {
  children: 'Decipad',
};
export default {
  title: 'Atoms / UI / Badge',
  component: Badge,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => <Badge {...props} />;
