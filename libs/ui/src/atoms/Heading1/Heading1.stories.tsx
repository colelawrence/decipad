import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { Meta, Story } from '@storybook/react';
import { Heading1 } from './Heading1';

const args = { children: 'What’s possible?' };

export default {
  title: 'Atoms / Editor / Text / Block / Heading 1',
  component: Heading1,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <Heading1 id="1" Heading="h2" {...props} />
);

export const Active: Story<typeof args> = (props) => (
  <BlockIsActiveProvider>
    <Heading1 id="1" Heading="h2" {...props} />
  </BlockIsActiveProvider>
);
