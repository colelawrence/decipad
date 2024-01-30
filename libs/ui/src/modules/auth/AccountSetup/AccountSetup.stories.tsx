import { Meta, StoryFn } from '@storybook/react';
import { AccountSetup } from './AccountSetup';

export default {
  title: 'Templates / Account / Setup',
  component: AccountSetup,
} as Meta;

export const Normal: StoryFn = () => (
  <AccountSetup left={'Left Side'} right={'Right Side'} />
);
