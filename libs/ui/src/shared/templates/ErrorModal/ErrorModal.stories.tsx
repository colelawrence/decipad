import { Meta, StoryFn } from '@storybook/react';
import { ErrorModal } from './ErrorModal';

export default {
  title: 'Templates / Error Modal',
  component: ErrorModal,
} as Meta;

export const Error404: StoryFn = () => (
  <ErrorModal Heading="h1" wellKnown="404" />
);
