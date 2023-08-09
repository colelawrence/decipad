import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookAvatars } from './NotebookAvatars';

const args: ComponentProps<typeof NotebookAvatars> = {
  notebook: {} as any,
  teamUsers: [],
  invitedUsers: [
    {
      user: {
        id: '0',
        name: 'Doe John',
        email: 'dough@nar.com',
      },
      permission: 'READ',
    },
    {
      user: {
        id: '0',
        name: 'John Doe',
        email: 'foo@nar.com',
      },
      permission: 'ADMIN',
    },
  ],
};

export default {
  title: 'Molecules / UI / Notebook Top Bar / Users',
  component: NotebookAvatars,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <NotebookAvatars {...props} />
);
