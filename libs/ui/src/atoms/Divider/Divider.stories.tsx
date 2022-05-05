import { Meta, Story } from '@storybook/react';
import { Divider } from './Divider';

export default {
  title: 'Atoms / Editor / Void / Divider',
  component: Divider,
} as Meta;

export const Normal: Story = () => (
  <>
    <p>
      This is just the beginning. We’ll be sharing more of our journey with our
      community along the way.
    </p>

    <Divider />
    <p>We hope to see you on Discord</p>
  </>
);
