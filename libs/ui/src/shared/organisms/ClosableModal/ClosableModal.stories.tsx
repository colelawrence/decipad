import { Meta, StoryFn } from '@storybook/react';
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

export const Normal: StoryFn<typeof args> = (props) => (
  <ClosableModal {...props} Heading="h1" closeAction="" />
);
