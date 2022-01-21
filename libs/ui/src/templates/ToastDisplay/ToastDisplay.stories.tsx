import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { AppearanceTypes, useToasts } from 'react-toast-notifications';
import { ToastDisplay } from './ToastDisplay';

const args = {
  text: 'Toast text',
};

export default {
  title: 'Templates / Toast Display',
  component: ToastDisplay,
  args,
} as Meta<ComponentProps<typeof ToastDisplay>>;

interface ToastButtonProps {
  readonly appearance: AppearanceTypes;
  readonly text: string;
}

const ToastButton = ({ appearance, text }: ToastButtonProps) => {
  const { addToast } = useToasts();
  return (
    <button onClick={() => addToast(text, { appearance })}>Click me</button>
  );
};

export const Info: Story<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} appearance="info" />
    </ToastDisplay>
  );
};

export const Success: Story<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} appearance="success" />
    </ToastDisplay>
  );
};

export const Error: Story<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} appearance="error" />
    </ToastDisplay>
  );
};

export const Warning: Story<typeof args> = (props) => {
  return (
    <ToastDisplay>
      <ToastButton {...props} appearance="warning" />
    </ToastDisplay>
  );
};
