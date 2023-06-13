import { ToastType, useToast } from '@decipad/toast';
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
  readonly type: ToastType;
  readonly text: string;
}

const ToastButton = ({ type, text }: ToastButtonProps) => {
  const toast = useToast();
  return <button onClick={() => toast(text, type)}>Click me</button>;
};

export const Info: StoryFn<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} type="info" />
    </ToastDisplay>
  );
};

export const Success: StoryFn<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} type="success" />
    </ToastDisplay>
  );
};

export const Error: StoryFn<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} type="error" />
    </ToastDisplay>
  );
};

export const Warning: StoryFn<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} type="warning" />
    </ToastDisplay>
  );
};
