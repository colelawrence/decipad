import { Meta, StoryFn } from '@storybook/react';
import { Button, ButtonProps } from './Button';

export default {
  title: 'Atoms / UI / Button',
  component: Button,
  argTypes: {
    children: {
      control: { type: 'text', required: true },
      defaultValue: 'Text',
    },
    type: {
      control: { type: 'radio' },
      options: [
        'secondary',
        'primary',
        'primaryBrand',
        'danger',
        'text',
        'darkDanger',
        'darkWarning',
        'darkWarningText',
      ],
      defaultValue: 'secondary',
    },
    size: {
      control: { type: 'radio' },
      options: ['normal', 'extraSlim', 'extraLarge'],
      defaultValue: 'normal',
    },
    disabled: {
      control: { type: 'boolean' },
      defaultValue: false,
    },
  },
} as Meta;
interface Args {
  children: string;
  type: 'primary' | 'primaryBrand' | 'secondary' | 'danger' | 'text';
  size: 'normal' | 'extraSlim' | 'extraLarge';
  disabled: boolean;
}

export const Normal: StoryFn<Args> = (props: ButtonProps) => (
  <Button {...props} />
);
