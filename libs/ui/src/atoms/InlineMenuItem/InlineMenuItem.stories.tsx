import { Meta, StoryFn } from '@storybook/react';
import { circleIcon, inMenu } from '../../storybook-utils';
import { InlineMenuItem } from './InlineMenuItem';

const args = {
  title: 'Title',
  description: 'Description goes here',
  enabled: true,
};

export default {
  title: 'Organisms / Editor / Inline Menu / Item',
  component: InlineMenuItem,
  args,
  decorators: [inMenu],
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <InlineMenuItem {...props} icon={circleIcon} />
);
