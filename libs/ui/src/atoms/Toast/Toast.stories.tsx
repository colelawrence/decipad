/* eslint decipad/css-prop-named-variable: 0 */
import { ToastType } from '@decipad/toast';
import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { Toast } from './Toast';

const toasts = ['info', 'success', 'error', 'warning'];

export default {
  title: 'Atoms / UI / Toast',
  component: Toast,
} as Meta<ComponentProps<typeof Toast>>;

export const Normal: StoryFn = () => (
  <div>
    {toasts.map((type) => (
      <Toast
        appearance={type as ToastType}
        children={`This is a ${type} message`}
      />
    ))}
  </div>
);

export const Collapsible: StoryFn = () => (
  <div css={{ display: 'flex', justifyContent: 'flex-end' }}>
    {toasts.map((type) => (
      <Toast
        appearance={type as ToastType}
        autoDismiss={false}
        children={`This is a ${type} message`}
      />
    ))}
  </div>
);
