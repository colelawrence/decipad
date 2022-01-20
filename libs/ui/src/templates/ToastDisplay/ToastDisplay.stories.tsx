import { Meta } from '@storybook/react';
import React, { ComponentProps } from 'react';
import { AppearanceTypes, useToasts } from 'react-toast-notifications';
import { ToastDisplay } from './ToastDisplay';

export default {
  title: 'Templates / Toast Display',
  component: ToastDisplay,
} as Meta<ComponentProps<typeof ToastDisplay>>;

interface ToastButtonProps {
  appearance: AppearanceTypes;
}

const ToastButton = ({ appearance }: ToastButtonProps) => {
  const { addToast } = useToasts();
  return (
    <button onClick={() => addToast('wawawea', { appearance })}>
      Click me
    </button>
  );
};

export const Info = (): ReturnType<React.FC> => {
  return (
    <ToastDisplay>
      <ToastButton appearance="info" />
    </ToastDisplay>
  );
};

export const Success = (): ReturnType<React.FC> => {
  return (
    <ToastDisplay>
      <ToastButton appearance="success" />
    </ToastDisplay>
  );
};

export const Error = (): ReturnType<React.FC> => {
  return (
    <ToastDisplay>
      <ToastButton appearance="error" />
    </ToastDisplay>
  );
};

export const Warning = (): ReturnType<React.FC> => {
  return (
    <ToastDisplay>
      <ToastButton appearance="warning" />
    </ToastDisplay>
  );
};
