import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { sidePadding } from '../../storybook-utils';
import { NotebookListItem } from './NotebookListItem';

type Args = Pick<
  ComponentProps<typeof NotebookListItem>,
  'name' | 'description'
>;

export default {
  title: 'Organisms / Notebook List / Item',
  decorators: [sidePadding(12)],
  component: NotebookListItem,
  args: {
    name: 'Getting started with Decipad',
    description:
      'Decipad is a low-code notebook that is easy and frictionless to use.',
  },
} as Meta<Args>;

export const Normal: Story<Args> = (args) => (
  <NotebookListItem {...args} href="" exportFileName="" exportHref="" />
);
