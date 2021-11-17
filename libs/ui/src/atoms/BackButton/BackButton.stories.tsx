import { Meta, Story } from '@storybook/react';
import { BackButton } from './BackButton';

export default {
  title: 'Atoms / Back Button',
  component: BackButton,
} as Meta;

export const Normal: Story = () => <BackButton href="" />;
