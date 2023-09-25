import { ToastStatus, useToast } from '@decipad/toast';
import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { ToastDisplay } from './ToastDisplay';

const args = {
  text: 'Toast text',
};

export default {
  title: 'Templates / Toast',
  component: ToastDisplay,
  args,
} as Meta<ComponentProps<typeof ToastDisplay>>;

interface ToastButtonProps {
  readonly status: ToastStatus;
  readonly text: string;
}

const ToastButton = ({ status, text }: ToastButtonProps) => {
  const toast = useToast();
  return <button onClick={() => toast(text, status)}>Click me</button>;
};

export const Info: StoryFn<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} status="info" />
    </ToastDisplay>
  );
};

export const Success: StoryFn<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} status="success" />
    </ToastDisplay>
  );
};

export const Error: StoryFn<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} status="error" />
    </ToastDisplay>
  );
};

export const Warning: StoryFn<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} status="warning" />
    </ToastDisplay>
  );
};
