import { Meta, StoryFn } from '@storybook/react';
import { ErrorPage } from './ErrorPage';

const args = {
  authenticated: false,
};

export default {
  title: 'Pages / Error',
  component: ErrorPage,
  args,
} as Meta;

export const Error404: StoryFn<typeof args> = (props) => (
  <ErrorPage {...props} Heading="h1" wellKnown="404" />
);
export const Error500: StoryFn<typeof args> = (props) => (
  <ErrorPage {...props} Heading="h1" wellKnown="500" />
);
export const Unknown: StoryFn<typeof args> = (props) => (
  <ErrorPage {...props} Heading="h1" />
);
