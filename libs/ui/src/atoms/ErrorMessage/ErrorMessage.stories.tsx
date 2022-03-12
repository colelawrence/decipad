import { Meta, Story } from '@storybook/react';
import { ErrorMessage } from './ErrorMessage';

const args = {
  message: 'This operation requires compatible units',
};

export default {
  title: 'Atoms / Plot / Error Message',
  component: ErrorMessage,
  args,
} as Meta;

export const Normal: Story = () => <ErrorMessage {...args} />;
