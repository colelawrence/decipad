import { Meta, StoryFn } from '@storybook/react';
import { AccountSetupFlow3 } from './AccountSetupFlow3';

export default {
  title: 'Pages / Account / Setup / Screen 3',
  component: AccountSetupFlow3,
} as Meta;

export const Normal: StoryFn = () => (
  <AccountSetupFlow3 email="nobody@foo.bar" />
);

export const WithGravatar: StoryFn = () => (
  <AccountSetupFlow3
    email="kelly@n1n.co"
    name="Kelly McEttrick"
    username="@kmctrick"
  />
);

export const WithDescription: StoryFn = () => (
  <AccountSetupFlow3
    description="Product and go-to-market guru"
    email="kelly@n1n.co"
    name="Kelly McEttrick"
    username="@kmctrick"
  />
);
