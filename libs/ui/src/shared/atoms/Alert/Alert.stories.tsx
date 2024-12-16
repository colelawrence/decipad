import { Meta, StoryFn } from '@storybook/react';
import { Alert, AlertDescription, AlertProps, AlertTitle } from './Alert';

export default {
  title: 'Atoms / UI / Alert',
  component: Alert,
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['error', 'warning', 'info'],
      defaultValue: 'error',
    },
  },
} as Meta<AlertProps>;

export const AsChildren: StoryFn<AlertProps> = (args: AlertProps) => (
  <Alert {...args}>Oops something broken, and that’s on us</Alert>
);

export const WithAlertTitle: StoryFn<AlertProps> = (args: AlertProps) => (
  <Alert {...args}>
    <AlertTitle>Oops something broken, and that’s on us</AlertTitle>
    <AlertDescription>This is the description of the error.</AlertDescription>
  </Alert>
);
