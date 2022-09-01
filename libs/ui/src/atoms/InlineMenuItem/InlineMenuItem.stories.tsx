import { Meta, Story } from '@storybook/react';
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
  parameters: {
    chromatic: { disable: true },
  },
  decorators: [inMenu],
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <InlineMenuItem {...props} icon={circleIcon} />
);
