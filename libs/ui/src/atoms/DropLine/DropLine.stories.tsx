import { Meta, Story } from '@storybook/react';
import { DropLine } from './DropLine';

export default {
  title: 'Atoms / Editor / Void / Drag & Drop Line',
  component: DropLine,
} as Meta;

export const Normal: Story = () => (
  <>
    (above)
    <DropLine />
    (below)
  </>
);

export const Inline: Story = () => (
  <span>
    (above)
    <DropLine variant="inline" />
    (below)
  </span>
);
