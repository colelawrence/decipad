import { Meta, StoryFn } from '@storybook/react';
import { Caption, CaptionProps } from './Caption';

const args = {
  children: <span>hello</span>,
};

export default {
  title: 'Molecules / Editor / Input / Caption',
  component: Caption,
  args,
} as Meta<typeof args>;

export const Normal: StoryFn<typeof args> = (props: CaptionProps) => (
  <Caption {...props} />
);
