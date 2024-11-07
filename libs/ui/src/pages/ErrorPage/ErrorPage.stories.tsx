import { Meta } from '@storybook/react';
import { ErrorPage, ErrorPageProps } from './ErrorPage';

const args = {
  authenticated: false,
};

export default {
  title: 'Pages / Error',
  component: ErrorPage,
  args,
} as Meta;

export const Error404 = (props: ErrorPageProps) => (
  <ErrorPage {...props} Heading="h1" wellKnown="404" />
);
export const Error500 = (props: ErrorPageProps) => (
  <ErrorPage {...props} Heading="h1" wellKnown="500" />
);
export const Unknown = (props: ErrorPageProps) => (
  <ErrorPage {...props} Heading="h1" />
);
