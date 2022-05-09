import { Meta, Story } from '@storybook/react';
import { ErrorModal } from './ErrorModal';

export default {
  title: 'Templates / Error Modal',
  component: ErrorModal,
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
} as Meta;

export const Error404: Story = () => (
  <ErrorModal Heading="h1" wellKnown="404" />
);
