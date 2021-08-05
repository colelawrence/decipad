import { Meta, Story } from '@storybook/react';
import { Divider } from './Divider';

export default {
  title: 'Atoms / Divider',
  component: Divider,
} as Meta;

export const Normal: Story = () => (
  <>
    (above)
    <Divider />
    (below)
  </>
);
