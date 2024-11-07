import { Meta } from '@storybook/react';
import { circleIcon, inMenu } from '../../../storybook-utils';
import { InlineMenuItem, InlineMenuItemProps } from './InlineMenuItem';

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

export const Normal = (props: InlineMenuItemProps) => (
  <InlineMenuItem {...props} icon={circleIcon} />
);
