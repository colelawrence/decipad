import { Meta, Story } from '@storybook/react';
import { AddNew } from './AddNew';

const args = {
  children: `Today, people and businesses have access to more data and information than ever before.`,
};

export default {
  title: 'Atoms / Editor / Columns / Add',
  component: AddNew,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <AddNew {...props} />;
