import { Meta, StoryFn } from '@storybook/react';
import { AccountSetupFlow2 } from './AccountSetupFlow2';

export default {
  title: 'Pages / Account / Setup / Screen 2',
  component: AccountSetupFlow2,
} as Meta;

export const Normal: StoryFn = () => <AccountSetupFlow2 />;
