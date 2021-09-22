import { Meta, Story } from '@storybook/react';
import { NotebookShareMenu } from './NotebookShareMenu';

const args = { link: 'https://decipad.example.com/look-at-this-notebook' };

export default {
  title: 'Organisms / Notebook / Share Menu',
  component: NotebookShareMenu,
  args,
} as Meta;

export const Normal: Story<typeof args> = (currentArgs) => (
  <NotebookShareMenu {...currentArgs} />
);
