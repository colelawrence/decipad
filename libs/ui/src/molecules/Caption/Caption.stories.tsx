import { Meta, Story } from '@storybook/react';
import { Caption } from './Caption';

const args = {
  children: <span>hello</span>,
};

export default {
  title: 'Molecules / Editor / Input / Caption',
  component: Caption,
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => <Caption {...props} />;
