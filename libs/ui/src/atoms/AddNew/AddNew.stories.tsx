import { Meta, Story } from '@storybook/react';
import { AddNew } from './AddNew';

const args = {
  children: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
  eiusmod tempor incididunt ut labore et dolore magna aliqua. `,
};

export default {
  title: 'Atoms / Add New',
  component: AddNew,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <AddNew {...props} />;
