import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { Meta, Story } from '@storybook/react';
import { sidePadding } from '../../storybook-utils';
import { Heading2 } from './Heading2';

const args = { children: 'Text' };

export default {
  title: 'Atoms / Editor / Text / Heading 2',
  component: Heading2,
  args,
  decorators: [sidePadding(6)],
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <Heading2 Heading="h3" {...props} />
);

export const Active: Story<typeof args> = (props) => (
  <BlockIsActiveProvider>
    <Heading2 Heading="h3" {...props} />
  </BlockIsActiveProvider>
);
