import { Meta, Story } from '@storybook/react';
import { Callout } from './Callout';

const args = { children: 'Text' };

export default {
  title: 'Atoms / Editor / Text / Callout',
  component: Callout,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <Callout {...props} />;
