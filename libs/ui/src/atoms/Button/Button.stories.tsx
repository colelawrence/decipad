import { Meta, Story } from '@storybook/react';
import { Button } from './Button';

export default {
  title: 'Atoms / Button',
  component: Button,
  argTypes: {
    children: {
      control: { type: 'text', required: true },
      defaultValue: 'Text',
    },
    type: {
      control: { type: 'radio' },
      options: ['secondary', 'primary', 'primaryBrand', 'danger'],
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
  type: 'primary' | 'primaryBrand' | 'secondary' | 'danger';
  size: 'normal' | 'extraSlim' | 'extraLarge';
  disabled: boolean;
}

export const Normal: Story<Args> = (props) => <Button {...props} />;
