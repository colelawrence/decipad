import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { Meta, Story } from '@storybook/react';
import { Heading1 } from './Heading1';

const args = { children: 'Text' };

export default {
  title: 'Atoms / Editor / Text / Heading 1',
  component: Heading1,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <Heading1 Heading="h2" {...props} />
);

export const Active: Story<typeof args> = (props) => (
  <BlockIsActiveProvider>
    <Heading1 Heading="h2" {...props} />
  </BlockIsActiveProvider>
);
