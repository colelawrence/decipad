import { Meta, Story } from '@storybook/react';
import { ListItem } from './ListItem';

const args = {
  children: 'Item',
};

export default {
  title: 'Atoms / List Item',
  component: ListItem,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <ListItem {...props} />;
