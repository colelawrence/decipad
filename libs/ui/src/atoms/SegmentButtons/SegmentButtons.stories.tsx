import { Meta, StoryFn } from '@storybook/react';
import { SegmentButtons } from './SegmentButtons';

export default {
  title: 'Atoms / Editor / Controls / Buttons / Segment',
  component: SegmentButtons,
} as Meta;

export const Empty: StoryFn<{ children: string }> = () => (
  <SegmentButtons buttons={[]} />
);
