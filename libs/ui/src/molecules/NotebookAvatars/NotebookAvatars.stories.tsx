import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { sidePadding } from '../../storybook-utils';
import { NotebookAvatars } from './NotebookAvatars';

const args: ComponentProps<typeof NotebookAvatars> = {
  usersWithAccess: [
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
  title: 'Molecules / Notebook / Users',
  component: NotebookAvatars,
  args,
  decorators: [sidePadding(6)],
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <NotebookAvatars {...props} />
);
