import { Meta, StoryFn } from '@storybook/react';
import { Badge, BadgeProps } from './Badge';

const args = {
  children: 'Decipad',
};
export default {
  title: 'Atoms / UI / Badge',
  component: Badge,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: BadgeProps) => (
  <Badge {...props} />
);
