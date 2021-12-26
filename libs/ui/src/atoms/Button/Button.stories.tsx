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
  },
} as Meta;

export const Secondary: Story<{ children: string }> = (args) => (
  <Button {...args} />
);

export const SecondaryExtraSlim: Story<{ children: string }> = (args) => (
  <Button extraSlim {...args} />
);

export const SecondaryExtraLarge: Story<{ children: string }> = (args) => (
  <Button extraLarge {...args} />
);

export const Primary: Story<{ children: string }> = (args) => (
  <Button primary {...args} />
);

export const PrimaryExtraSlim: Story<{ children: string }> = (args) => (
  <Button primary extraSlim {...args} />
);

export const PrimaryExtraLarge: Story<{ children: string }> = (args) => (
  <Button primary extraLarge {...args} />
);

export const Disabled: Story<{ children: string }> = (args) => (
  <Button disabled {...args} />
);

export const DisabledExtraSlim: Story<{ children: string }> = (args) => (
  <Button disabled extraSlim {...args} />
);

export const DisabledExtraLarge: Story<{ children: string }> = (args) => (
  <Button disabled extraLarge {...args} />
);
