import { Meta, Story } from '@storybook/react';
import { ClosableModalHeader } from './ClosableModalHeader';

const args = {
  title: 'Title',
};

export default {
  title: 'Molecules / Modal / Closable Header',
  component: ClosableModalHeader,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <ClosableModalHeader Heading="h1" {...props} closeAction="" />
);
