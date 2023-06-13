import { Meta, StoryFn } from '@storybook/react';
import { ClosableModalHeader } from './ClosableModalHeader';

const args = {
  title: 'Title',
};

export default {
  title: 'Molecules / UI / Modal / Closable Header',
  component: ClosableModalHeader,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <ClosableModalHeader Heading="h1" {...props} closeAction="" />
);
