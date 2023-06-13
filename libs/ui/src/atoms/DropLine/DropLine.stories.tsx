import { Meta, StoryFn } from '@storybook/react';
import { DropLine } from './DropLine';

export default {
  title: 'Atoms / Editor / Void / Drag & Drop Line',
  component: DropLine,
} as Meta;

export const Normal: StoryFn = () => (
  <>
    (above)
    <DropLine />
    (below)
  </>
);

export const Inline: StoryFn = () => (
  <span>
    (above)
    <DropLine variant="inline" />
    (below)
  </span>
);
