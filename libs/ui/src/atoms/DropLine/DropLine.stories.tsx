import { Meta, Story } from '@storybook/react';
import { DropLine } from './DropLine';

export default {
  title: 'Atoms / Drag and Drop / Drop Line',
  component: DropLine,
} as Meta;

export const Normal: Story = () => (
  <>
    (above)
    <DropLine />
    (below)
  </>
);
