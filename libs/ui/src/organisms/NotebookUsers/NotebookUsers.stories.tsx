import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { sidePadding } from '../../storybook-utils';
import { NotebookUsers } from './NotebookUsers';

const args: ComponentProps<typeof NotebookUsers> = {
  users: [
    {
      user: {
        id: '0',
        name: 'Doe John',
      },
      permission: 'READ',
    },
    {
      user: {
        id: '0',
        name: 'John Doe',
      },
      permission: 'ADMIN',
    },
  ],
};

export default {
  title: 'Organisms / Notebook / Users',
  component: NotebookUsers,
  args,
  decorators: [sidePadding(6)],
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <NotebookUsers {...props} />
);
