import { Meta, Story } from '@storybook/react';
import { ClosableModal } from './ClosableModal';

const args = {
  title: 'Title',
  children: 'Content',
};

export default {
  title: 'Organisms / UI / Modal / Closable',
  component: ClosableModal,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <ClosableModal {...props} Heading="h1" closeAction="" />
);
